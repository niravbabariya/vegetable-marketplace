const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Mongoose Schemas (using flexible Schema with strict: false so existing JSON fields pass cleanly)
const userSchema = new mongoose.Schema({ id: { type: String, unique: true, required: true } }, { strict: false, timestamps: true });
const productSchema = new mongoose.Schema({ id: { type: String, unique: true, required: true } }, { strict: false, timestamps: true });
const orderSchema = new mongoose.Schema({ id: { type: String, unique: true, required: true } }, { strict: false, timestamps: true });

const UserModel = mongoose.model('User', userSchema);
const ProductModel = mongoose.model('Product', productSchema);
const OrderModel = mongoose.model('Order', orderSchema);

let isConnected = false;

const fileToModelMap = {
  'users.json': UserModel,
  'products.json': ProductModel,
  'orders.json': OrderModel
};

/**
 * Initialize connection to MongoDB Atlas if MONGODB_URI is defined in environment.
 * Automatically migrates existing local JSON data on first boot if DB collections are empty.
 */
async function connectDB(dataDir) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ MONGODB_URI not set. Running in local JSON file mode.');
    return false;
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Auto-seed MongoDB from JSON files if database is fresh/empty
    await autoSeedDatabase(dataDir);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    console.log('⚠️ Falling back to local JSON file mode.');
    isConnected = false;
    return false;
  }
}

/**
 * Seeds MongoDB collections from local seed/JSON files if collection is empty
 */
async function autoSeedDatabase(dataDir) {
  const files = [
    { file: 'users.json', seedFile: 'users.seed.json', model: UserModel },
    { file: 'products.json', seedFile: 'products.seed.json', model: ProductModel },
    { file: 'orders.json', seedFile: 'orders.seed.json', model: OrderModel }
  ];

  for (const item of files) {
    try {
      const count = await item.model.countDocuments();
      if (count === 0) {
        let sourcePath = path.join(dataDir, item.file);
        if (!fs.existsSync(sourcePath)) {
          sourcePath = path.join(dataDir, item.seedFile);
        }
        if (fs.existsSync(sourcePath)) {
          const raw = fs.readFileSync(sourcePath, 'utf8');
          const data = JSON.parse(raw);
          if (Array.isArray(data) && data.length > 0) {
            await item.model.insertMany(data);
            console.log(`🌱 Auto-seeded MongoDB collection '${item.model.collection.name}' with ${data.length} records from ${path.basename(sourcePath)}.`);
          }
        }
      }
    } catch (err) {
      console.error(`⚠️ Failed to auto-seed ${item.file} into MongoDB:`, err.message);
    }
  }
}

/**
 * Reads data asynchronously from MongoDB if connected, else falls back to local JSON file
 */
async function readDataAsync(file, dataDir) {
  const model = fileToModelMap[file];
  if (isConnected && model) {
    try {
      const docs = await model.find({}).lean();
      // Remove MongoDB internal _id and __v for clean API compatibility
      return docs.map(doc => {
        const { _id, __v, ...rest } = doc;
        return rest;
      });
    } catch (err) {
      console.error(`Error reading ${file} from MongoDB:`, err.message);
    }
  }

  // Fallback: local JSON file read
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return [];
  }
}

/**
 * Writes data asynchronously to MongoDB if connected, and synced to local JSON file
 */
async function writeDataAsync(file, data, dataDir) {
  const model = fileToModelMap[file];
  
  if (isConnected && model && Array.isArray(data)) {
    try {
      // Replace collection content to keep in sync
      await model.deleteMany({});
      if (data.length > 0) {
        await model.insertMany(data);
      }
    } catch (err) {
      console.error(`Error writing ${file} to MongoDB:`, err.message);
    }
  }

  // Always keep local file updated as backup
  try {
    const filePath = path.join(dataDir, file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing local ${file}:`, err.message);
  }
}

module.exports = {
  connectDB,
  readDataAsync,
  writeDataAsync,
  isMongoConnected: () => isConnected
};
