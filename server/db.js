import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable buffering so queries fail quickly if disconnected instead of hanging 10 seconds
mongoose.set('bufferCommands', false);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://tusharskattimanitushar_db_user:JxTObaA51VgcTtaO@cluster0.l9z1wri.mongodb.net/shop_db?retryWrites=true&w=majority&appName=Cluster0";

let isConnecting = false;
let lastAttempt = 0;
const RETRY_INTERVAL = 30000;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) return;
  const now = Date.now();
  if (now - lastAttempt < RETRY_INTERVAL) return;
  lastAttempt = now;
  isConnecting = true;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ Connected to MongoDB Atlas (database: shop_db)');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  } finally {
    isConnecting = false;
  }
}

// Location Schema
const locationSchema = new mongoose.Schema({
  location_name: { type: String, required: true },
  order_number: { type: Number, default: 0 },
  district: { type: String, default: '' },
  taluk: { type: String, default: '' },
  area: { type: String, default: '' },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Shop Schema
const shopSchema = new mongoose.Schema({
  shop_name: { type: String, required: true },
  contact_person: { type: String, default: '' },
  mobile_number: { type: String, required: true, unique: true },
  location_id: { type: String, default: null },
  full_address: { type: String, default: '' },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);
export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
