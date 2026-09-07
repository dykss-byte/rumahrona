export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  color: string;
  imageSrc?: string;
  sizes: string[];
  tag?: string;
};

export type CartItem = { product: Product; size: string; quantity: number };
export type Order = { id: string; items: CartItem[]; total: number; status: string };

export const products: Product[] = [
  { id: 1, name: "Kemeja Linen Aruna", price: 289000, category: "Atasan", image: "linen", imageSrc: "/pakaian/kemeja%20linen%20aruna.jpg", sizes: ["S", "M", "L", "XL"], color: "#d6b48a", tag: "BEST SELLER" },
  { id: 2, name: "Blouse Katun Senja", price: 249000, category: "Atasan", image: "blouse", imageSrc: "/pakaian/blouse%20katun%20senja.jpg", sizes: ["S", "M", "L", "XL"], color: "#e8b2a6" },
  { id: 3, name: "Celana Santai Karsa", price: 319000, category: "Bawahan", image: "pants", imageSrc: "/pakaian/celana%20santai%20karsa.jpg", sizes: ["S", "M", "L", "XL"], color: "#a6b0a0" },
  { id: 4, name: "Outer Rajut Nala", price: 379000, category: "Outer", image: "knit", imageSrc: "/pakaian/outher%20rajut%20nala.jpg", sizes: ["S", "M", "L", "XL"], color: "#b7a4b8", tag: "NEW" },
  { id: 5, name: "Rok Midi Bumi", price: 299000, category: "Bawahan", image: "skirt", imageSrc: "/pakaian/rok%20midi%20bumi.jpg", sizes: ["S", "M", "L", "XL"], color: "#b99b76" },
  { id: 6, name: "Dress Pagi Teduh", price: 429000, category: "Dress", image: "dress", imageSrc: "/pakaian/dress%20pagi%20teduh.jpg", sizes: ["S", "M", "L", "XL"], color: "#d9c6ad" },
];

export const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
