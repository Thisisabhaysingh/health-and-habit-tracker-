const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration from your app
const firebaseConfig = {
  apiKey: "AIzaSyBv3KBIP-T6Bhx_7dO0sfOGb9woqdpxp2Q",
  authDomain: "sidhealthcareapp.firebaseapp.com",
  projectId: "sidhealthcareapp",
  storageBucket: "sidhealthcareapp.firebasestorage.app",
  messagingSenderId: "506606835618",
  appId: "1:506606835618:web:d35690e459e8e7fbc6c4fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import the Indian meal library data
const { INDIAN_MEAL_LIBRARY } = require('./mealData.js');

async function seedMeals() {
  try {
    console.log('Starting to seed meals from meal.md data...');
    
    const mealsCollection = collection(db, 'meals');
    
    // Add each meal from the Indian meal library
    for (const meal of INDIAN_MEAL_LIBRARY) {
      const mealData = {
        name: meal.name,
        calories: meal.calories,
        category: meal.category,
        portion: meal.portion,
        unit: meal.unit,
        bmiCategory: meal.bmiCategory,
        tags: meal.tags,
        region: meal.region,
        mealType: meal.mealType,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      await addDoc(mealsCollection, mealData);
      console.log(`✅ Added meal: ${meal.name} (${meal.region} - ${meal.category})`);
    }
    
    console.log(`🎉 Successfully seeded ${INDIAN_MEAL_LIBRARY.length} meals!`);
    
  } catch (error) {
    console.error('❌ Error seeding meals:', error);
  }
}

// Run the function
seedMeals().then(() => {
  console.log('Meal seeding process completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
