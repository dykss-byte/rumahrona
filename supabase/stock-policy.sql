-- Jalankan sekali di Supabase SQL Editor.
-- Dibutuhkan karena checkout memakai anon key untuk mengurangi stok.
alter table public.products enable row level security;

drop policy if exists "public can read products" on public.products;
create policy "public can read products"
on public.products for select
using (true);

drop policy if exists "public can update product stock" on public.products;
create policy "public can update product stock"
on public.products for update
using (true)
with check (stock >= 0);
