export type Category = {
  id: string;
  name: string;
  accent: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
};

// 1. AHORA LAS CATEGORÍAS COINCIDEN CON LOS BOTONES DE LA INTERFAZ
export const categories: Category[] = [
  { id: "individuales", name: "Individuales", accent: "from-orange-500 to-amber-400" },
  { id: "antojos", name: "Según tu antojo", accent: "from-lime-500 to-green-600" },
  { id: "promociones", name: "Promociones", accent: "from-orange-600 to-red-500" },
  { id: "extras", name: "Aguadito / Extras", accent: "from-emerald-500 to-lime-500" },
  { id: "bebidas", name: "Bebidas", accent: "from-cyan-500 to-blue-600" },
  { id: "postres", name: "Postres", accent: "from-pink-500 to-rose-500" },
  { id: "salsas", name: "Salsas", accent: "from-yellow-500 to-orange-600" },
  { id: "acomp", name: "Acompañamientos", accent: "from-emerald-500 to-lime-500" },
];

// 2. HEMOS REASIGNADO LOS PRODUCTOS A SUS NUEVAS CATEGORÍAS
export const products: Product[] = [
  {
    id: "1",
    name: "Pollo a la Brasa Deluxe",
    description: "Pollo marinado, papas, ají verde y ensalada.",
    price: 24,
    image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783346356/ChatGPT_Image_6_jul_2026_08_59_08_govkqh.png",
    category: "individuales", // <-- Actualizado
    badge: "Más pedido",
  },
  {
    id: "2",
    name: "Super Combo Tía Tula",
    description: "2 presas, papas, salsa criolla y bebida.",
    price: 31,
    image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783365698/images_a2ahv5.jpg",
    category: "promociones", // <-- Actualizado
    badge: "Combo Familiar",
  },
  {
    id: "3",
    name: "Churrasco de Pollo",
    description: "Jugoso y con sabor ahumado a la brasa.",
    price: 19,
    image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783365769/receta-churrasco-pollo-la-parrilla_aoswwh.jpg",
    category: "antojos", // <-- Actualizado
  },
  {
    id: "4",
    name: "Refresco Premium",
    description: "Elige entre maracuyá, cola o limonada.",
    price: 6,
    image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783365867/images_1_z9x2wj.jpg",
    category: "bebidas",
  },
  {
    id: "5",
    name: "Suspiro Limeño",
    description: "Postre tradicional con crema y dulce de leche.",
    price: 8,
    image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783365936/images_2_kwmjkh.jpg",
    category: "postres",
  },
  {
    id: "6",
    name: "Salsa de la Casa",
    description: "Picante, cremosa y perfecta para acompañar.",
    price: 3,
    image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783366023/images_3_ykzhbo.jpg",
    category: "salsas",
  },
  {
    id: "7",
    name: "Papas Rústicas",
    description: "Crujientes y servidas con ajo y perejil.",
    price: 7,
    image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783366054/papas-rusticas-OR42ODYMUJAZ3O7UJY4QRKU5SQ_atnxcx.avif",
    category: "acomp",
  },
];

export const branches = [
  { id: "principal", name: "Local Principal", address: "Av. Acomayo 111, Ica (esquina del Puente Grau)", eta: "15 min" },
  { id: "sucursal", name: "Sucursal Centro", address: "AA.HH. 28 de Julio Mz G, Lt 7, Parcona", eta: "20 min" },
];

export const deliverySteps = [
  "Preparando",
  "Pedido listo",
  "Repartidor asignado",
  "En camino",
  "Entregado",
];