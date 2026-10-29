const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./authRoutes');

// Helper to parse price string or number
function getNumericPrice(p) {
  if (typeof p.priceNumeric === 'number' || typeof p.priceNumeric === 'bigint') {
    return Number(p.priceNumeric);
  }
  if (p.totalPrice) {
    const match = p.totalPrice.match(/([\d\.]+)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (p.totalPrice.includes('Cr')) return val * 10000000;
      if (p.totalPrice.includes('Lakh') || p.totalPrice.includes('L')) return val * 100000;
      return val;
    }
  }
  return 0;
}

// GET /api/v1/properties/featured
router.get('/featured', (req, res) => {
  try {
    const properties = db.getProperties();
    const featured = properties.filter(p => p.featured);
    res.json({ count: featured.length, properties: featured });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/properties/map (Optimized for map rendering around Parandur)
router.get('/map', (req, res) => {
  try {
    const properties = db.getProperties();
    const mapMarkers = properties.map(p => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      category: p.category,
      type: p.type,
      location: p.location,
      latitude: p.coordinates?.lat || 12.9885,
      longitude: p.coordinates?.lng || 79.7642,
      price: p.totalPrice,
      pricePerSqFt: p.pricePerSqFt,
      areaSqFt: p.areaSqFt,
      areaCents: p.areaCents,
      status: p.status,
      availablePlots: p.availablePlots,
      image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
      distanceToAirport: p.distanceToAirport
    }));

    res.json({
      center: {
        latitude: 12.9885,
        longitude: 79.7642,
        regionName: 'Parandur Greenfield Airport Corridor, Tamil Nadu'
      },
      count: mapMarkers.length,
      markers: mapMarkers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/properties (Main list & filters)
router.get('/', (req, res) => {
  try {
    let properties = db.getProperties();
    const {
      search,
      propertyId,
      category,
      type,
      availability,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      sort
    } = req.query;

    // Filter by Search Query (title, location, id, RERA, description)
    if (search) {
      const q = search.toLowerCase().trim();
      properties = properties.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.microMarket?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.reraNumber?.toLowerCase().includes(q) ||
        p.dtcpNumber?.toLowerCase().includes(q)
      );
    }

    if (propertyId) {
      properties = properties.filter(p => p.id.toLowerCase() === propertyId.toLowerCase());
    }

    if (category && category !== 'all') {
      properties = properties.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }

    if (type && type !== 'all') {
      properties = properties.filter(p => p.type?.toLowerCase() === type.toLowerCase());
    }

    if (availability && availability !== 'all') {
      properties = properties.filter(p => p.status?.toLowerCase() === availability.toLowerCase());
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      properties = properties.filter(p => getNumericPrice(p) >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      properties = properties.filter(p => getNumericPrice(p) <= max);
    }

    if (minArea) {
      const minA = parseInt(minArea, 10);
      properties = properties.filter(p => (p.areaSqFt || 0) >= minA);
    }

    if (maxArea) {
      const maxA = parseInt(maxArea, 10);
      properties = properties.filter(p => (p.areaSqFt || 0) <= maxA);
    }

    // Sorting
    if (sort === 'price_asc') {
      properties.sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
    } else if (sort === 'price_desc') {
      properties.sort((a, b) => getNumericPrice(b) - getNumericPrice(a));
    } else if (sort === 'area_asc') {
      properties.sort((a, b) => (a.areaSqFt || 0) - (b.areaSqFt || 0));
    } else if (sort === 'area_desc') {
      properties.sort((a, b) => (b.areaSqFt || 0) - (a.areaSqFt || 0));
    } else if (sort === 'newest') {
      // Keep default or reverse
    }

    res.json({
      count: properties.length,
      properties
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/properties/:id
router.get('/:id', (req, res) => {
  try {
    const properties = db.getProperties();
    const property = properties.find(p => p.id.toLowerCase() === req.params.id.toLowerCase());
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    res.json({ property });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Favourites Endpoints
// GET /api/v1/favourites
router.get('/favourites/my', authenticateToken, (req, res) => {
  try {
    const users = db.getUsers();
    const user = users.find(u => u.id === req.user.id);
    const favIds = user?.favorites || [];
    const allProps = db.getProperties();
    const favProperties = allProps.filter(p => favIds.includes(p.id));
    res.json({ favorites: favIds, properties: favProperties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/favourites
router.post('/favourites', authenticateToken, (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ error: 'Property ID required' });
    const users = db.getUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!user.favorites) user.favorites = [];
    if (!user.favorites.includes(propertyId)) {
      user.favorites.push(propertyId);
      db.saveUsers(users);
    }
    res.json({ message: 'Added to favourites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/favourites/:propertyId
router.delete('/favourites/:propertyId', authenticateToken, (req, res) => {
  try {
    const { propertyId } = req.params;
    const users = db.getUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.favorites = (user.favorites || []).filter(id => id !== propertyId);
    db.saveUsers(users);
    res.json({ message: 'Removed from favourites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
