-- Jalankan sekali di Supabase SQL Editor.
-- Dibutuhkan karena checkout memakai anon key untuk mengurangi stok.
alter table public.products add column if not exists description text default '';

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

drop policy if exists "public can insert products" on public.products;
create policy "public can insert products"
on public.products for insert
with check (stock >= 0);

drop policy if exists "public can delete products" on public.products;
create policy "public can delete products"
on public.products for delete
using (true);
