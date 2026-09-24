-- Jalankan seluruh script ini di Supabase SQL Editor.

alter table public.orders
add column if not exists status text default 'Pesanan diterima';

update public.orders
set status = 'Pesanan diterima'
where status is null;

alter table public.orders enable row level security;

drop policy if exists "public can read orders" on public.orders;
create policy "public can read orders"
on public.orders for select
to public
using (true);

drop policy if exists "public can update order status" on public.orders;
create policy "public can update order status"
on public.orders for update
to public
using (true)
with check (status in ('Pesanan diterima', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'));

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

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
end
$$;

notify pgrst, 'reload schema';
