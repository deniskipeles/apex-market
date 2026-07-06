export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Electronics' | 'Wellness' | 'Smart Home' | 'Fashion' | 'Lifestyle';
  image: string;
  brand: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  tags: string[];
  isRecommended?: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "AeroSound Max ANC Headphones",
    description: "Premium over-ear wireless headphones with active noise cancellation, high-fidelity audio, and up to 40 hours of battery life. Built-in responsive touch controls.",
    price: 189.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    brand: "AeroSound",
    rating: 4.8,
    reviewsCount: 124,
    stock: 15,
    tags: ["headphones", "audio", "wireless", "music", "gadget", "black", "sound"],
    isRecommended: true
  },
  {
    id: "prod-2",
    name: "Lumina Smart Wake-Up Light",
    description: "Simulate natural sunrises and sunsets with this elegant smart alarm clock. Features customized mood lighting, built-in ambient soundscapes, and full app integration.",
    price: 79.50,
    category: "Smart Home",
    image: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80",
    brand: "Lumina",
    rating: 4.6,
    reviewsCount: 89,
    stock: 32,
    tags: ["lamp", "smart", "clock", "light", "bedroom", "gadget", "sunrise"],
    isRecommended: true
  },
  {
    id: "prod-3",
    name: "HydroFocus Smart Flask",
    description: "Vacuum-insulated stainless steel water bottle with an LED touch cap that displays water temperature and tracks your daily hydration goals with glow reminders.",
    price: 45.00,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    brand: "HydroFocus",
    rating: 4.5,
    reviewsCount: 62,
    stock: 24,
    tags: ["bottle", "flask", "water", "health", "smart", "fitness", "blue"],
    isRecommended: false
  },
  {
    id: "prod-4",
    name: "Solas Leather Travel Backpack",
    description: "Handcrafted top-grain leather backpack featuring water-resistant lining, dedicated 16\" laptop sleeve, and ergonomic breathable strap padding for long travels.",
    price: 149.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    brand: "Solas",
    rating: 4.9,
    reviewsCount: 156,
    stock: 8,
    tags: ["backpack", "bag", "leather", "travel", "fashion", "brown", "laptop"],
    isRecommended: true
  },
  {
    id: "prod-5",
    name: "Verdant Aura Air Purifier",
    description: "True HEPA filter desktop air purifier. Removes 99.97% of dust, pollen, and pet dander with a silent motor and subtle warm ambient nightlight.",
    price: 99.99,
    category: "Smart Home",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80",
    brand: "Verdant",
    rating: 4.7,
    reviewsCount: 74,
    stock: 18,
    tags: ["purifier", "air", "filter", "smart", "home", "healthy", "white"],
    isRecommended: false
  },
  {
    id: "prod-6",
    name: "ThermaKnead Shiatsu Massager",
    description: "Deep-tissue kneading electric neck and back massager with optional heat therapy and adjustable straps for target tension relief anywhere.",
    price: 59.99,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92834909?auto=format&fit=crop&w=600&q=80",
    brand: "ThermaKnead",
    rating: 4.4,
    reviewsCount: 215,
    stock: 12,
    tags: ["massager", "wellness", "therapy", "heat", "health", "massage"],
    isRecommended: false
  },
  {
    id: "prod-7",
    name: "Chrono Minimalist Watch",
    description: "An elegant, unisex time-piece featuring a sapphire glass cover, high-precision Swiss quartz movement, and interchangeable genuine suede leather straps.",
    price: 129.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80",
    brand: "Chrono",
    rating: 4.7,
    reviewsCount: 95,
    stock: 10,
    tags: ["watch", "minimalist", "fashion", "leather", "time", "luxury", "black"],
    isRecommended: true
  },
  {
    id: "prod-8",
    name: "ZenGlow Essential Oil Diffuser",
    description: "Handcrafted ceramic ultrasonic oil diffuser with a 150ml water capacity, auto-shutoff mechanism, and 7 comforting LED color cycles.",
    price: 39.99,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
    brand: "ZenGlow",
    rating: 4.5,
    reviewsCount: 182,
    stock: 25,
    tags: ["diffuser", "wellness", "aromatherapy", "ceramic", "home", "relax"],
    isRecommended: true
  },
  {
    id: "prod-9",
    name: "NeoCharge 3-in-1 Power Stand",
    description: "Sleek aluminum magnetic charging station that simultaneously powers your smartphone, wireless earbuds, and smart watch. Minimizes cable clutter.",
    price: 69.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80",
    brand: "NeoCharge",
    rating: 4.6,
    reviewsCount: 110,
    stock: 30,
    tags: ["charger", "power", "electronics", "stand", "magnetic", "wireless"],
    isRecommended: false
  },
  {
    id: "prod-10",
    name: "Culina Cast Iron Skillet Set",
    description: "Pre-seasoned heavy-duty cast iron skillets (10-inch and 12-inch) featuring superior heat retention and distribution. Perfect for stovetops, ovens, or open fire.",
    price: 54.99,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
    brand: "Culina",
    rating: 4.8,
    reviewsCount: 310,
    stock: 15,
    tags: ["skillet", "cast iron", "cookware", "kitchen", "cooking", "pan"],
    isRecommended: false
  },
  {
    id: "prod-11",
    name: "VividLife Portable Projector",
    description: "Ultra-compact 1080p supported pocket projector with built-in stereo speakers, wireless screen mirroring, and long-lasting LED lamp up to 30,000 hours.",
    price: 159.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80",
    brand: "VividLife",
    rating: 4.5,
    reviewsCount: 42,
    stock: 10,
    tags: ["projector", "electronics", "video", "cinema", "wireless", "gadget"],
    isRecommended: false
  },
  {
    id: "prod-12",
    name: "Soleil Hemp Linen Bedding Set",
    description: "Luxuriously soft and breathable bedding set crafted from 100% natural organic hemp linen fibers. Hypoallergenic, temperature regulating, and pre-washed.",
    price: 210.00,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    brand: "Soleil",
    rating: 4.9,
    reviewsCount: 38,
    stock: 5,
    tags: ["bedding", "linen", "bedroom", "home", "organic", "luxury", "sheet"],
    isRecommended: true
  }
];
