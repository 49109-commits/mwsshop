// Product interface based on PLAN.md specifications
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

// Product categories
export const categories = [
  'Tools'
];

// Sample product data
export const products: Product[] = [
  {
    id: '1',
    name: 'Beng-Beng',
    description: 'A famous wafer snack from Indonesia. It\'s known for its four layers: crispy wafer, soft caramel, rice crispies, and a thick chocolate coating.',
    price: 1.50,
    imageUrl: '/images/product-1.png',
    category: 'Tools',
  },
  {
    id: '2',
    name: 'Bigga American Style',
    description: 'A chocolate-flavored corn puff snack. It\'s crunchy, sweet, and usually has a very airy texture.',
    price: 1.00,
    imageUrl: '/images/product-2.png',
    category: 'Tools',
  },
  {
    id: '3',
    name: 'Kisco Deno Choco Stone',
    description: 'Fun, novelty chocolate candies that are candy-coated and shaped to look exactly like colorful river stones or aquarium pebbles.',
    price: 1.50,
    imageUrl: '/images/product-3.png',
    category: 'Tools',
  },
  {
    id: '4',
    name: 'Campus Choco',
    description: 'A crunchy chocolate-coated snack that often comes with collectible cards—this specific pack features characters from the anime Jujutsu Kaisen.',
    price: 1.25,
    imageUrl: '/images/product-4.png',
    category: 'Tools',
  },
  {
    id: '5',
    name: 'Cheetos Puffs',
    description: 'The puffed version of the famous cheese snack. These are lighter and airier than the "Crunchy" version and melt in your mouth with a strong cheddar flavor.',
    price: 2.00,
    imageUrl: '/images/product-5.png',
    category: 'Tools',
  },
  {
    id: '6',
    name: 'Coca-Cola',
    description: 'A classic glass bottle of Coke, specifically showing Thai script on the label.',
    price: 1.50,
    imageUrl: '/images/product-6.png',
    category: 'Tools',
  },
  {
    id: '7',
    name: 'Nestlé Temptations',
    description: 'A large tub of "Crazy for Cookies & Cream" ice cream. It\'s a vanilla base loaded with chocolate cookie chunks.',
    price: 5.00,
    imageUrl: '/images/product-7.png',
    category: 'Tools',
  },
  {
    id: '8',
    name: 'KitKat',
    description: 'The classic "Have a Break" chocolate. This is the standard 4-finger milk chocolate wafer bar produced by Nestlé.',
    price: 1.75,
    imageUrl: '/images/product-8.png',
    category: 'Tools',
  },
  {
    id: '9',
    name: 'Lay\'s Sour Cream & Dill',
    description: 'Potato chips seasoned with the tangy flavor of sour cream and the herby, slightly sharp taste of dill.',
    price: 2.50,
    imageUrl: '/images/product-9.png',
    category: 'Tools',
  },
  {
    id: '10',
    name: 'Mansome',
    description: 'A popular functional drink in Thailand marketed toward men. This specific blue version contains collagen, Vitamin C, and Zinc.',
    price: 3.00,
    imageUrl: '/images/product-10.png',
    category: 'Tools',
  },
  {
    id: '11',
    name: 'Walls Paddle Pop',
    description: 'A Minions-themed ice cream bar. This is a caramel and chocolate flavored popsicle, shaped like a Minion character from The Rise of Gru.',
    price: 2.00,
    imageUrl: '/images/product-11.png',
    category: 'Tools',
  },
  {
    id: '12',
    name: 'Monster Energy',
    description: 'The classic "Original Green" Monster energy drink, known for its sweet, punch-like flavor.',
    price: 3.50,
    imageUrl: '/images/product-12.png',
    category: 'Tools',
  },
  {
    id: '13',
    name: 'Oreo',
    description: 'The classic chocolate sandwich cookie with a sweet creme filling.',
    price: 2.50,
    imageUrl: '/images/product-13.png',
    category: 'Tools',
  },
  {
    id: '14',
    name: 'Pepsi',
    description: 'A standard plastic bottle of Pepsi cola.',
    price: 1.50,
    imageUrl: '/images/product-14.png',
    category: 'Tools',
  },
  {
    id: '15',
    name: 'Prime Hydration IShowSpeed',
    description: 'A limited-edition hydration drink created in collaboration with the YouTuber IShowSpeed. It features a unique Dragon Fruit Acai flavor.',
    price: 4.00,
    imageUrl: '/images/product-15.png',
    category: 'Tools',
  },
  {
    id: '16',
    name: 'Red Bull',
    description: 'A tall can of Red Bull energy drink. Interestingly, this specific can features Italian text ("Servire ghiacciato", which translates to "Serve chilled").',
    price: 3.00,
    imageUrl: '/images/product-16.png',
    category: 'Tools',
  },
  {
    id: '17',
    name: 'Snack Jack',
    description: 'A green pea snack from Thailand. This specific package is the "Spicy Volcano Scallops" flavor.',
    price: 1.25,
    imageUrl: '/images/product-17.png',
    category: 'Tools',
  },
  {
    id: '18',
    name: 'Sprite',
    description: 'A classic green can of the popular lemon-lime soda.',
    price: 1.50,
    imageUrl: '/images/product-18.png',
    category: 'Tools',
  },
  {
    id: '19',
    name: 'Tao Kae Noi',
    description: 'A highly popular crispy seaweed snack. This red bag indicates their Hot & Spicy flavor.',
    price: 2.00,
    imageUrl: '/images/product-19.png',
    category: 'Tools',
  },
  {
    id: '20',
    name: 'Tawan',
    description: 'Triangular-shaped tapioca chips. This specific green bag is the Crispy Prawn flavor.',
    price: 1.50,
    imageUrl: '/images/product-20.png',
    category: 'Tools',
  },
  {
    id: '21',
    name: 'Nestlé Super Choc Pop',
    description: 'A vanilla ice cream bar on a stick, coated in a hard chocolate shell with crushed nuts.',
    price: 2.00,
    imageUrl: '/images/product-21.png',
    category: 'Tools',
  },
  {
    id: '22',
    name: 'MWS Drinking Water',
    description: 'A standard plastic bottle of clean drinking water produced by MATHAYOM WATSING.',
    price: 0.50,
    imageUrl: '/images/product-22.png',
    category: 'Tools',
  },
  {
    id: '23',
    name: 'Bic Pen',
    description: 'The iconic Bic Cristal ballpoint pen. This one has a clear hexagonal barrel with a blue cap and plug, indicating blue ink.',
    price: 0.50,
    imageUrl: '/images/product-23.png',
    category: 'Tools',
  },
  {
    id: '24',
    name: 'Pentel Pen',
    description: 'A Pentel "iFeel-it!" ballpoint pen. This specific pen features red ink, a 1.0mm tip, and a textured rubber grip for comfortable writing.',
    price: 1.00,
    imageUrl: '/images/product-24.png',
    category: 'Tools',
  },
  {
    id: '25',
    name: 'Casio Calculator',
    description: 'A Casio DJ-120D desktop calculator. It\'s a standard office calculator featuring a 12-digit display, two-way power (solar and battery), and a 150-step check and correct function.',
    price: 15.00,
    imageUrl: '/images/product-25.png',
    category: 'Tools',
  },
];

// Get products by category
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

// Get a random selection of products for the landing page
export const getRandomProducts = (count: number = 6): Product[] => {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
