// Firebase database seeding script
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push } = require('firebase/database');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Your Firebase config (from app.json)
const firebaseConfig = {
  apiKey: "AIzaSyBv3KBIP-T6Bhx_7dO0sfOGb9woqdpxp2Q",
  authDomain: "sidhealthcareapp.firebaseapp.com",
  projectId: "sidhealthcareapp",
  storageBucket: "sidhealthcareapp.firebasestorage.app",
  messagingSenderId: "506606835618",
  appId: "1:506606835618:web:d35690e459e8e7fbc6c4fb",
  databaseURL: "https://sidhealthcareapp-default-rtdb.firebaseio.com",
  measurementId: "G-K8RFJ5LZ5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Demo data
const demoMeals = [
  {
    foodName: 'Overnight Oats',
    calories: 320,
    portion: 1,
    unit: 'serving',
    loggedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    foodName: 'Grilled Paneer Salad',
    calories: 450,
    portion: 1,
    unit: 'serving',
    loggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    foodName: 'Green Smoothie',
    calories: 180,
    portion: 1,
    unit: 'serving',
    loggedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

const demoExerciseTasks = [
  {
    label: 'Mobility Flow',
    minutes: 15,
    category: 'mobility',
    completed: true
  },
  {
    label: 'Strength Circuit',
    minutes: 20,
    category: 'strength',
    completed: false
  },
  {
    label: 'Step Goal',
    minutes: 45,
    category: 'steps',
    completed: false
  }
];

const demoScreenSessions = Array.from({ length: 7 }).map((_, idx) => {
  const d = new Date();
  d.setDate(d.getDate() - idx);
  return {
    date: d.toISOString().split('T')[0],
    minutes: 180 - idx * 10 + (idx % 2 === 0 ? 15 : -5)
  };
});

// Seed function
async function seedDatabase() {
  try {
    console.log('Authenticating with Firebase...');
    
    // Authenticate with your credentials
    const userCredential = await signInWithEmailAndPassword(auth, 'abhay@gmail.com', 'Abhay@3268');
    const userId = userCredential.user.uid;
    console.log('Authenticated successfully. User ID:', userId);
    
    // Seed meals
    console.log('Seeding meals...');
    const mealsRef = ref(db, `users/${userId}/meals`);
    for (const meal of demoMeals) {
      const newMealRef = push(mealsRef);
      await set(newMealRef, meal);
      console.log('Added meal:', meal.foodName);
    }
    
    // Seed exercise tasks
    console.log('Seeding exercise tasks...');
    const exerciseRef = ref(db, `users/${userId}/exerciseTasks`);
    for (const task of demoExerciseTasks) {
      const newTaskRef = push(exerciseRef);
      await set(newTaskRef, task);
      console.log('Added exercise task:', task.label);
    }
    
    // Seed screen sessions
    console.log('Seeding screen sessions...');
    const screenRef = ref(db, `users/${userId}/screenSessions`);
    for (const session of demoScreenSessions) {
      const newSessionRef = push(screenRef);
      await set(newSessionRef, session);
      console.log('Added screen session for:', session.date);
    }
    
    // Create user profile
    console.log('Creating user profile...');
    const profileRef = ref(db, `users/${userId}`);
    await set(profileRef, {
      uid: userId,
      email: 'abhay@gmail.com',
      name: 'Abhay',
      age: 25,
      heightCm: 175,
      weightKg: 70,
      bmi: 22.9,
      bmiCategory: 'Normal',
      calorieTarget: 2000,
      screenTimeLimitMin: 180,
      createdAt: new Date().toISOString()
    });
    
    console.log('Database seeding completed successfully!');
    console.log('User ID:', userId);
    console.log('You can now login with abhay@gmail.com and Abhay@3268');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error.code === 'auth/user-not-found') {
      console.log('User not found. Creating new user...');
      // If user doesn't exist, you'll need to create it through the app first
    } else if (error.code === 'auth/wrong-password') {
      console.log('Wrong password. Please check your credentials.');
    } else if (error.code === 'permission_denied') {
      console.log('Permission denied. Please update Firebase Realtime Database rules to allow read/write access.');
    }
  }
}

// Run the seeding
seedDatabase();
