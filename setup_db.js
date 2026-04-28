const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setup() {
  // 1. Initial Settings
  await db.collection('settings').doc('current').set({
    reservePercentage: 20,
    profitDistribution: {
      you: 30,
      rahman: 30,
      truckOwner: 15
    }
  });

  // 2. Initial Investor (Ajmal)
  await db.collection('investors').doc('ajmal').set({
    name: 'Ajmal',
    totalInvestment: 200000,
    remainingCapital: 200000,
    profitPercentage: 25,
    postRecoveryPercentage: 15,
    status: 'active'
  });

  // 3. Create Demo Users (Passwords would need to be set via Auth)
  // This is just to create the profile in Firestore
  const users = [
    { id: 'admin_id', name: 'Admin User', role: 'admin' },
    { id: 'operator_id', name: 'Operator User', role: 'operator' },
    { id: 'investor_id', name: 'Ajmal Investor', role: 'investor' }
  ];

  for (const user of users) {
    await db.collection('users').doc(user.id).set({
      name: user.name,
      role: user.role
    });
  }

  console.log('Database setup complete!');
}

setup().catch(console.error);
