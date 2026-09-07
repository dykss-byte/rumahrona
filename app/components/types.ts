export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  color: string;
  tag?: string;
};

export const products: Product[] = [
  { id: 1, name: "Kemeja Linen Aruna", price: 289000, category: "Atasan", image: "linen", color: "#d6b48a", tag: "BEST SELLER" },
  { id: 2, name: "Blouse Katun Senja", price: 249000, category: "Atasan", image: "blouse", color: "#e8b2a6" },
  { id: 3, name: "Celana Santai Karsa", price: 319000, category: "Bawahan", image: "pants", color: "#a6b0a0" },
  { id: 4, name: "Outer Rajut Nala", price: 379000, category: "Outer", image: "knit", color: "#b7a4b8", tag: "NEW" },
  { id: 5, name: "Rok Midi Bumi", price: 299000, category: "Bawahan", image: "skirt", color: "#b99b76" },
  { id: 6, name: "Dress Pagi Teduh", price: 429000, category: "Dress", image: "dress", color: "#d9c6ad" },
];

export const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
