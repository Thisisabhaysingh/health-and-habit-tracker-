const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function clearAllMeals() {
  try {
    console.log('Starting to clear all meal data...');
    
    // Get all meals from the meals collection
    const mealsCollection = collection(db, 'meals');
    const mealsSnapshot = await getDocs(mealsCollection);
    
    if (mealsSnapshot.empty) {
      console.log('No meals found to delete.');
      return;
    }
    
    console.log(`Found ${mealsSnapshot.size} meals to delete.`);
    
    // Delete each meal document
    const deletePromises = [];
    mealsSnapshot.forEach((mealDoc) => {
      deletePromises.push(deleteDoc(doc(db, 'meals', mealDoc.id)));
    });
    
    await Promise.all(deletePromises);
    
    console.log('✅ Successfully deleted all meals!');
    
  } catch (error) {
    console.error('❌ Error clearing meals:', error);
  }
}

// Run the function
clearAllMeals().then(() => {
  console.log('Meal clearing process completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
