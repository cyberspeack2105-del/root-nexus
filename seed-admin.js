const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://raju:raju2105@cluster0.dsttruk.mongodb.net/root2005?appName=Cluster0';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '$2b$12$2e2Hxo9ouRMo5XsLZdAZiuRGV1Hoh2ElMudpMtK7B18KgHMzu7IiG';

async function seedAdmin() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('root2005');
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admins').findOne({ username: ADMIN_USERNAME });
    if (existingAdmin) {
      console.log('✓ Admin user already exists in database');
      return;
    }
    
    // Insert admin user
    const result = await db.collection('admins').insertOne({
      username: ADMIN_USERNAME,
      password_hash: ADMIN_PASSWORD_HASH,
      created_at: new Date().toISOString(),
    });
    
    console.log('✓ Admin user created successfully');
    console.log('  ID:', result.insertedId);
    console.log('  Username:', ADMIN_USERNAME);
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedAdmin();
