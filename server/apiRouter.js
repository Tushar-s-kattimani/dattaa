import express from 'express';
import mongoose from 'mongoose';
import { connectDB, Location, Shop, isDBConnected } from './db.js';

const router = express.Router();

// Health check
router.get('/health', async (req, res) => {
  if (!isDBConnected()) {
    await connectDB();
  }
  const isConnected = isDBConnected();
  res.json({
    status: isConnected ? 'ok' : 'disconnected',
    database: 'mongodb',
    connected: isConnected
  });
});

// Translation cache in memory
const memoryTranslationCache = new Map();

// POST /api/translate - Google Translate proxy with caching
router.post('/translate', async (req, res) => {
  try {
    const { texts, target } = req.body;
    if (!Array.isArray(texts) || !target) {
      return res.status(400).json({ error: 'Invalid texts or target language' });
    }

    if (target === 'en') {
      const identityMap = {};
      texts.forEach(t => { identityMap[t] = t; });
      return res.json({ translations: identityMap });
    }

    const translations = {};
    const textsToFetch = [];

    for (const text of texts) {
      if (!text || typeof text !== 'string' || !text.trim() || /^\d+$/.test(text.trim())) {
        translations[text] = text;
        continue;
      }
      const cacheKey = `${target}:${text.trim()}`;
      if (memoryTranslationCache.has(cacheKey)) {
        translations[text] = memoryTranslationCache.get(cacheKey);
      } else {
        textsToFetch.push(text);
      }
    }

    // Process in parallel with concurrency limit
    await Promise.all(
      textsToFetch.map(async (text) => {
        const cacheKey = `${target}:${text.trim()}`;
        try {
          // 1. Try MyMemory API (high success rate, reliable for Indian languages)
          const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|${encodeURIComponent(target)}`;
          const memRes = await fetch(myMemoryUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (memRes.ok) {
            const memData = await memRes.json();
            const translated = memData?.responseData?.translatedText;
            if (translated && !translated.startsWith('MYMEMORY WARNING:')) {
              memoryTranslationCache.set(cacheKey, translated);
              translations[text] = translated;
              return;
            }
          }
        } catch (memErr) {
          // Fall through to Google Translate
        }

        try {
          // 2. Fallback to Google Translate
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text.trim())}`;
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && Array.isArray(data[0])) {
              const translated = data[0].map((item) => item[0]).join('');
              if (translated) {
                memoryTranslationCache.set(cacheKey, translated);
                translations[text] = translated;
                return;
              }
            }
          }
        } catch (gtxErr) {
          // Fall through to original
        }

        translations[text] = text;
      })
    );

    res.json({ translations });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Middleware to ensure DB connection
router.use(async (req, res, next) => {
  if (!isDBConnected()) {
    await connectDB();
  }
  if (!isDBConnected()) {
    return res.status(503).json({
      error: 'MongoDB Atlas is not connected (IP not whitelisted or offline).'
    });
  }
  next();
});

// --- LOCATIONS ---

// GET /api/locations - sorted by order_number (1, 2, 3...)
router.get('/locations', async (req, res) => {
  try {
    let locations = await Location.find().sort({ order_number: 1, location_name: 1 });
    let needsUpdate = false;
    for (let i = 0; i < locations.length; i++) {
      if (!locations[i].order_number || locations[i].order_number <= 0) {
        needsUpdate = true;
        locations[i].order_number = i + 1;
        await Location.findByIdAndUpdate(locations[i]._id, { order_number: i + 1 }).catch(() => null);
      }
    }
    if (needsUpdate) {
      locations = await Location.find().sort({ order_number: 1, location_name: 1 });
    }
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/locations/reorder - bulk update order of locations
router.put('/locations/reorder', async (req, res) => {
  try {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      await Promise.all(
        orders.map(item => {
          const num = Number(item.order_number) || 0;
          return Location.updateOne(
            { $or: [{ _id: item.id }, { id: item.id }] },
            { $set: { order_number: num } }
          );
        })
      );
    }
    const locations = await Location.find().sort({ order_number: 1, location_name: 1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/locations
router.post('/locations', async (req, res) => {
  try {
    const { location_name, district, taluk, area, is_default, order_number } = req.body;
    if (!location_name || !location_name.trim()) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    if (is_default) {
      await Location.updateMany({}, { is_default: false });
    }

    const count = await Location.countDocuments();
    const assignedOrder = order_number !== undefined && order_number !== null
      ? Number(order_number)
      : count + 1;

    const newLocation = new Location({
      location_name: location_name.trim(),
      order_number: assignedOrder,
      district: district || '',
      taluk: taluk || '',
      area: area || '',
      is_default: Boolean(is_default)
    });

    const saved = await newLocation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/locations/:id
router.put('/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name, district, taluk, area, is_default, order_number } = req.body;

    if (is_default) {
      await Location.updateMany({ _id: { $ne: id } }, { is_default: false });
    }

    const updateFields = {
      location_name: location_name?.trim(),
      district: district || '',
      taluk: taluk || '',
      area: area || '',
      is_default: Boolean(is_default)
    };

    if (order_number !== undefined && order_number !== null) {
      updateFields.order_number = Number(order_number);
    }

    const updated = await Location.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/locations/:id
router.delete('/locations/:id', async (req, res) => {
  try {
    const pwd = req.headers['x-delete-password'] || req.body?.password;
    if (pwd !== '151571') {
      return res.status(403).json({ error: 'Unauthorized: Invalid deletion password' });
    }

    const { id } = req.params;
    const mongoose = (await import('mongoose')).default;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Location.findByIdAndDelete(id);
      await Shop.updateMany({ location_id: id }, { location_id: null });
    } else {
      await Location.deleteOne({ $or: [{ _id: id }, { id }] }).catch(() => null);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- SHOPS ---

// GET /api/shops
router.get('/shops', async (req, res) => {
  try {
    const [shops, locations] = await Promise.all([
      Shop.find().sort({ created_at: -1 }),
      Location.find()
    ]);

    const locMap = new Map(locations.map(l => [l._id.toString(), l.toJSON()]));

    const result = shops.map(s => {
      const json = s.toJSON();
      json.location = json.location_id ? locMap.get(json.location_id) : undefined;
      return json;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shops
router.post('/shops', async (req, res) => {
  try {
    const { shop_name, contact_person, mobile_number, location_id, full_address, notes } = req.body;

    if (!shop_name || !mobile_number) {
      return res.status(400).json({ error: 'Shop name and mobile number are required' });
    }

    // Check duplicate mobile
    const existing = await Shop.findOne({ mobile_number: mobile_number.trim() });
    if (existing) {
      return res.status(400).json({ error: 'A shop with this mobile number already exists' });
    }

    const newShop = new Shop({
      shop_name: shop_name.trim(),
      contact_person: contact_person?.trim() || '',
      mobile_number: mobile_number.trim(),
      location_id: location_id || null,
      full_address: full_address?.trim() || '',
      notes: notes?.trim() || ''
    });

    const saved = await newShop.save();
    const json = saved.toJSON();

    if (json.location_id) {
      const loc = await Location.findById(json.location_id);
      if (loc) json.location = loc.toJSON();
    }

    res.status(201).json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/shops/:id
router.put('/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_name, contact_person, mobile_number, location_id, full_address, notes } = req.body;

    if (!shop_name || !mobile_number) {
      return res.status(400).json({ error: 'Shop name and mobile number are required' });
    }

    const trimmedMobile = mobile_number.trim();
    const mongoose = (await import('mongoose')).default;

    // Check duplicate mobile excluding this shop
    const duplicateQuery = mongoose.Types.ObjectId.isValid(id)
      ? { mobile_number: trimmedMobile, _id: { $ne: id } }
      : { mobile_number: trimmedMobile, $nor: [{ _id: id }, { id: id }] };

    const duplicate = await Shop.findOne(duplicateQuery);
    if (duplicate) {
      return res.status(400).json({ error: 'A shop with this mobile number already exists' });
    }

    const updateFields = {
      shop_name: shop_name.trim(),
      mobile_number: trimmedMobile,
      location_id: location_id || null,
      updated_at: new Date()
    };
    if (contact_person !== undefined) updateFields.contact_person = contact_person?.trim() || '';
    if (full_address !== undefined) updateFields.full_address = full_address?.trim() || '';
    if (notes !== undefined) updateFields.notes = notes?.trim() || '';

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Shop.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    } else {
      updated = await Shop.findOneAndUpdate(
        { $or: [{ _id: id }, { id }] },
        { $set: updateFields },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const json = updated.toJSON();
    if (json.location_id) {
      const loc = mongoose.Types.ObjectId.isValid(json.location_id)
        ? await Location.findById(json.location_id)
        : await Location.findOne({ $or: [{ _id: json.location_id }, { id: json.location_id }] });
      if (loc) json.location = loc.toJSON();
    }

    res.json(json);
  } catch (err) {
    console.error('Error updating shop:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/shops/:id
router.delete('/shops/:id', async (req, res) => {
  try {
    const pwd = req.headers['x-delete-password'] || req.body?.password;
    if (pwd !== '151571') {
      return res.status(403).json({ error: 'Unauthorized: Invalid deletion password' });
    }

    const { id } = req.params;
    const mongoose = (await import('mongoose')).default;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Shop.findByIdAndDelete(id);
    } else {
      await Shop.deleteOne({ $or: [{ _id: id }, { id }] }).catch(() => null);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting shop:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- STATS ---

// GET /api/stats
router.get('/stats', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalShops, totalLocations, shopsAddedToday] = await Promise.all([
      Shop.countDocuments(),
      Location.countDocuments(),
      Shop.countDocuments({ created_at: { $gte: todayStart } })
    ]);

    res.json({ totalShops, totalLocations, shopsAddedToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
