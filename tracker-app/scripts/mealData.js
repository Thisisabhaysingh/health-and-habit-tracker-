// Export the Indian meal library data as plain JavaScript
const INDIAN_MEAL_LIBRARY = [
  // BREAKFAST
  { id: 'upma', name: 'Upma', calories: 275, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['south-indian', 'regular'], region: 'South India', mealType: 'Regular' },
  { id: 'poha', name: 'Poha', calories: 255, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['central-indian', 'light'], region: 'Central India', mealType: 'Light' },
  { id: 'bread-pulav', name: 'Bread Pulav', calories: 325, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'regular'], region: 'North India', mealType: 'Regular' },
  { id: 'sabudana-khichdi', name: 'Sabudana Khichdi', calories: 375, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'heavy'], region: 'Maharashtra', mealType: 'Heavy' },
  { id: 'bread-butter-jam', name: 'Bread Butter Jam', calories: 300, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'light'], region: 'Pan India', mealType: 'Light' },
  { id: 'idli-chutney', name: 'Idli Chutney', calories: 225, category: 'breakfast', portion: '2', unit: 'serving', bmiCategory: 'normal', tags: ['south-indian', 'light'], region: 'South India', mealType: 'Light' },
  { id: 'egg-omelette', name: 'Egg Omelette', calories: 200, category: 'breakfast', portion: '2', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'protein'], region: 'Pan India', mealType: 'Protein' },
  { id: 'bhurji-pav', name: 'Bhurji Pav', calories: 425, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'heavy'], region: 'Maharashtra', mealType: 'Heavy' },
  { id: 'sandwich', name: 'Sandwich', calories: 325, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['urban', 'regular'], region: 'Urban India', mealType: 'Regular' },
  { id: 'pithla', name: 'Pithla', calories: 250, category: 'breakfast', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'traditional'], region: 'Maharashtra', mealType: 'Traditional' },

  // LUNCH
  { id: 'lauki', name: 'Bottle Gourd (Lauki)', calories: 120, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'veg'], region: 'North India', mealType: 'Veg' },
  { id: 'hara-moong-dal', name: 'Hara Moong Dal', calories: 180, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'dal'], region: 'Pan India', mealType: 'Dal' },
  { id: 'rice', name: 'Rice (1 plate)', calories: 200, category: 'lunch', portion: '1', unit: 'plate', bmiCategory: 'normal', tags: ['pan-india', 'staple'], region: 'Pan India', mealType: 'Staple' },
  { id: 'roti', name: 'Roti (1)', calories: 100, category: 'lunch', portion: '1', unit: 'piece', bmiCategory: 'normal', tags: ['north-indian', 'staple'], region: 'North India', mealType: 'Staple' },
  { id: 'sambar', name: 'Sambar', calories: 150, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['south-indian', 'dal'], region: 'South India', mealType: 'Dal' },
  { id: 'yellow-aloo', name: 'Yellow Aloo', calories: 220, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'veg'], region: 'North India', mealType: 'Veg' },
  { id: 'chicken-curry', name: 'Chicken Curry', calories: 375, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'non-veg'], region: 'North India', mealType: 'Non-Veg' },
  { id: 'chicken-biryani', name: 'Chicken Biryani', calories: 600, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['hyderabadi', 'special'], region: 'Hyderabad', mealType: 'Special' },
  { id: 'paneer-curry', name: 'Paneer Curry', calories: 350, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'veg-protein'], region: 'North India', mealType: 'Veg Protein' },
  { id: 'paneer-biryani', name: 'Paneer Biryani', calories: 500, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'special'], region: 'North India', mealType: 'Special' },
  { id: 'missal-pav', name: 'Missal Pav', calories: 650, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'heavy'], region: 'Maharashtra', mealType: 'Heavy' },
  { id: 'pav-bhaji', name: 'Pav Bhaji', calories: 550, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'street-food'], region: 'Maharashtra', mealType: 'Street Food' },
  { id: 'chinese-rice', name: 'Chinese Rice', calories: 450, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['indo-chinese', 'urban'], region: 'Urban', mealType: 'Indo-Chinese' },
  { id: 'egg-curry', name: 'Egg Curry', calories: 300, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'protein'], region: 'Pan India', mealType: 'Protein' },
  { id: 'soya-chunks-curry', name: 'Soya Chunks Curry', calories: 280, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'protein'], region: 'Pan India', mealType: 'Protein' },
  { id: 'mix-vegetables', name: 'Mix Vegetables', calories: 150, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'veg'], region: 'Pan India', mealType: 'Veg' },
  { id: 'rajma', name: 'Rajma', calories: 280, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'protein'], region: 'North India', mealType: 'Protein' },
  { id: 'chole', name: 'Chole', calories: 300, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['punjab', 'protein'], region: 'Punjab', mealType: 'Protein' },
  { id: 'mataki', name: 'Mataki', calories: 250, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'traditional'], region: 'Maharashtra', mealType: 'Traditional' },
  { id: 'kadhi', name: 'Kadhi', calories: 200, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'light'], region: 'North India', mealType: 'Light' },
  { id: 'pulav', name: 'Pulav', calories: 350, category: 'lunch', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'regular'], region: 'Pan India', mealType: 'Regular' },

  // SNACKS
  { id: 'banana', name: 'Banana', calories: 90, category: 'snack', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['healthy', 'fruit'], region: 'Pan India', mealType: 'Healthy' },
  { id: 'milk', name: 'Milk (200ml)', calories: 120, category: 'snack', portion: '200', unit: 'ml', bmiCategory: 'normal', tags: ['protein', 'dairy'], region: 'Pan India', mealType: 'Protein' },
  { id: 'chana', name: 'Chana', calories: 180, category: 'snack', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['protein', 'healthy'], region: 'Pan India', mealType: 'Protein' },
  { id: 'shengdana-mix', name: 'Shengdana Mix', calories: 250, category: 'snack', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['energy', 'maharashtrian'], region: 'Maharashtra', mealType: 'Energy' },
  { id: 'jaggery', name: 'Gud (Jaggery)', calories: 120, category: 'snack', portion: '1', unit: 'piece', bmiCategory: 'normal', tags: ['sweet', 'traditional'], region: 'Pan India', mealType: 'Sweet' },
  { id: 'fresh-fruits', name: 'Fresh Fruits', calories: 100, category: 'snack', portion: '1', unit: 'bowl', bmiCategory: 'normal', tags: ['healthy', 'vitamins'], region: 'Pan India', mealType: 'Healthy' },
  { id: 'chikki', name: 'Chikki', calories: 200, category: 'snack', portion: '1', unit: 'piece', bmiCategory: 'normal', tags: ['sweet', 'energy'], region: 'Pan India', mealType: 'Sweet' },
  { id: 'biscuits', name: 'Biscuits', calories: 150, category: 'snack', portion: '2', unit: 'pieces', bmiCategory: 'normal', tags: ['light', 'processed'], region: 'Pan India', mealType: 'Light' },
  { id: 'dry-snacks', name: 'Dry Snacks', calories: 250, category: 'snack', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['junk', 'processed'], region: 'Pan India', mealType: 'Junk' },
  { id: 'chips', name: 'Chips', calories: 300, category: 'snack', portion: '1', unit: 'packet', bmiCategory: 'normal', tags: ['junk', 'unhealthy'], region: 'Pan India', mealType: 'Junk' },

  // DINNER
  { id: 'chavali', name: 'Chavali', calories: 250, category: 'dinner', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'protein'], region: 'Maharashtra', mealType: 'Protein' },
  { id: 'masur-dal', name: 'Masur Dal', calories: 180, category: 'dinner', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'dal'], region: 'Pan India', mealType: 'Dal' },
  { id: 'bhendi', name: 'Bhendi', calories: 150, category: 'dinner', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['maharashtrian', 'veg'], region: 'Maharashtra', mealType: 'Veg' },
  { id: 'yellow-moong-dal', name: 'Yellow Moong Dal', calories: 160, category: 'dinner', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'light'], region: 'Pan India', mealType: 'Light' },
  { id: 'bitter-gourd', name: 'Bitter Gourd', calories: 120, category: 'dinner', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['pan-india', 'light'], region: 'Pan India', mealType: 'Light' },
  { id: 'lal-chana', name: 'Lal Chana', calories: 260, category: 'dinner', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'protein'], region: 'North India', mealType: 'Protein' },
  { id: 'lauki-potato', name: 'Lauki + Potato', calories: 220, category: 'dinner', portion: '1', unit: 'serving', bmiCategory: 'normal', tags: ['north-indian', 'regular'], region: 'North India', mealType: 'Regular' },
  { id: 'dal-rice', name: 'Dal Rice', calories: 380, category: 'dinner', portion: '1', unit: 'plate', bmiCategory: 'normal', tags: ['pan-india', 'simple'], region: 'Pan India', mealType: 'Simple' },
  { id: 'papad', name: 'Papad', calories: 50, category: 'dinner', portion: '1', unit: 'piece', bmiCategory: 'normal', tags: ['pan-india', 'side'], region: 'Pan India', mealType: 'Side' },
  { id: 'pickle', name: 'Pickle', calories: 40, category: 'dinner', portion: '1', unit: 'spoon', bmiCategory: 'normal', tags: ['pan-india', 'side'], region: 'Pan India', mealType: 'Side' },
  { id: 'noodles', name: 'Chinese / Noodles', calories: 550, category: 'dinner', portion: '1', unit: 'plate', bmiCategory: 'normal', tags: ['indo-chinese', 'heavy'], region: 'Urban', mealType: 'Heavy' },
  { id: 'pasta', name: 'Pasta', calories: 550, category: 'dinner', portion: '1', unit: 'plate', bmiCategory: 'normal', tags: ['western', 'heavy'], region: 'Western', mealType: 'Heavy' },
  { id: 'masala-rice', name: 'Masala Rice', calories: 450, category: 'dinner', portion: '1', unit: 'plate', bmiCategory: 'normal', tags: ['south-indian', 'regular'], region: 'South India', mealType: 'Regular' }
];

module.exports = { INDIAN_MEAL_LIBRARY };
