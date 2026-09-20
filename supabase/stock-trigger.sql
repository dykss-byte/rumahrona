-- Jalankan sekali di Supabase SQL Editor.
-- Stok akan berkurang otomatis setiap order_items baru berhasil disimpan.
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
