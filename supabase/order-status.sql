-- Jalankan sekali di Supabase SQL Editor agar status admin tersimpan dan
-- dapat dibaca kembali oleh pembeli pada halaman tracking.
alter table public.orders add column if not exists status text default 'Pesanan diterima';

update public.orders
set status = 'Pesanan diterima'
where status is null;

alter table public.orders enable row level security;

drop policy if exists "public can read orders" on public.orders;
create policy "public can read orders"
on public.orders for select
using (true);

drop policy if exists "public can update order status" on public.orders;
create policy "public can update order status"
on public.orders for update
using (true)
with check (status in ('Pesanan diterima', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'));
