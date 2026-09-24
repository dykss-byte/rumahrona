-- Jalankan sekali pada Supabase SQL Editor project yang dipakai aplikasi.
-- Script ini menyiapkan stok, pesanan, item pesanan, dan status tracking.

alter table public.products add column if not exists description text default '';
alter table public.orders add column if not exists status text default 'Pesanan diterima';
-- Index biasa dipakai agar setup tetap berhasil meskipun ada data lama
-- dengan nomor pesanan yang sama.
drop index if exists public.orders_order_number_unique;
create index if not exists orders_order_number_idx on public.orders (order_number);

update public.orders
set status = 'Pesanan diterima'
where status is null;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "public can read products" on public.products;
create policy "public can read products" on public.products for select using (true);

drop policy if exists "public can update product stock" on public.products;
create policy "public can update product stock" on public.products for update using (true) with check (stock >= 0);

drop policy if exists "public can insert products" on public.products;
create policy "public can insert products" on public.products for insert with check (stock >= 0);

drop policy if exists "public can delete products" on public.products;
create policy "public can delete products" on public.products for delete using (true);

drop policy if exists "public can read orders" on public.orders;
create policy "public can read orders" on public.orders for select using (true);

drop policy if exists "public can insert orders" on public.orders;
create policy "public can insert orders" on public.orders for insert with check (status is null or status in ('Pesanan diterima', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'));

drop policy if exists "public can update order status" on public.orders;
create policy "public can update order status" on public.orders for update using (true) with check (status in ('Pesanan diterima', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'));

create or replace function public.update_order_status(p_order_number text, p_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order public.orders;
begin
  if p_status not in ('Pesanan diterima', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan') then
    raise exception 'Status pesanan tidak valid';
  end if;

  update public.orders
  set status = p_status
  where order_number = p_order_number
  returning * into updated_order;

  if updated_order is null then
    raise exception 'Pesanan tidak ditemukan';
  end if;

  return updated_order;
end;
$$;

grant execute on function public.update_order_status(text, text) to anon, authenticated;

drop policy if exists "public can read order items" on public.order_items;
create policy "public can read order items" on public.order_items for select using (true);

drop policy if exists "public can insert order items" on public.order_items;
create policy "public can insert order items" on public.order_items for insert with check (true);

create or replace function public.decrease_product_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock = greatest(coalesce(stock, 0) - new.quantity, 0)
  where lower(trim(name)) = lower(trim(new.product_name));
  return new;
end;
$$;

drop trigger if exists order_items_decrease_product_stock on public.order_items;
create trigger order_items_decrease_product_stock
after insert on public.order_items
for each row execute function public.decrease_product_stock();

-- Aktifkan sinkronisasi realtime untuk status pesanan.
alter table public.orders replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end
$$;
