// src/data/mockData.js
// Demo restaurant / dhaba deals. Times are generated relative to "now" so the demo always has live deals.
import { clockIn } from "../utils/time";

export const categories = ["All", "Meals", "Snacks", "Sweets & Dessert", "Drinks"];

const deal = (id, o) => ({
  id,
  address: "Sector 17, Chandigarh",
  rating: 4.3,
  image: null,
  pickupStart: clockIn(-30),
  ...o,
  pickupEnd: clockIn(o.closesInMin),
});

export const initialDeals = [
  deal("d1", { name: "Dal makhani + 4 butter roti", shop: "Gill Da Dhaba", category: "Meals", veg: true, price: 99, original: 220, distanceKm: 0.6, stock: 5, closesInMin: 45, description: "Cooked today. Packed fresh at pickup." }),
  deal("d2", { name: "Chicken curry + 2 tandoori roti", shop: "Gill Da Dhaba", category: "Meals", veg: false, price: 129, original: 280, distanceKm: 0.6, stock: 4, closesInMin: 45, description: "Cooked today. Packed fresh at pickup." }),
  deal("d3", { name: "Rajma chawal (full plate)", shop: "Punjabi Rasoi", category: "Meals", veg: true, price: 70, original: 150, distanceKm: 1.1, stock: 6, closesInMin: 90, description: "Cooked today. Packed fresh at pickup." }),
  deal("d4", { name: "Paneer tikka (6 pieces)", shop: "Tandoori Junction", category: "Snacks", veg: true, price: 119, original: 260, distanceKm: 1.8, stock: 3, closesInMin: 30, description: "Cooked today. Packed fresh at pickup." }),
  deal("d5", { name: "Veg samosa (4 pieces)", shop: "Kailash Sweets", category: "Snacks", veg: true, price: 40, original: 80, distanceKm: 0.9, stock: 8, closesInMin: 120, description: "Cooked today. Packed fresh at pickup." }),
  deal("d6", { name: "Gulab jamun (6 pieces)", shop: "Kailash Sweets", category: "Sweets & Dessert", veg: true, price: 60, original: 140, distanceKm: 0.9, stock: 5, closesInMin: 120, description: "Made today. Packed fresh at pickup." }),
  deal("d7", { name: "Kheer (2 cups)", shop: "Punjabi Rasoi", category: "Sweets & Dessert", veg: true, price: 50, original: 120, distanceKm: 1.1, stock: 4, closesInMin: 90, description: "Made today. Packed fresh at pickup." }),
  deal("d8", { name: "Sweet lassi (large)", shop: "Lassi Corner", category: "Drinks", veg: true, price: 45, original: 90, distanceKm: 1.4, stock: 6, closesInMin: 60, description: "Made today. Served chilled." }),
];