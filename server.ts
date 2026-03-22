import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database
  let admins = [
    { id: '1', email: 'admin@driveselect.com', password: await bcrypt.hash('admin123', 10) }
  ];
  let cars = [
    {
      id: '1',
      name: 'Model S',
      brand: 'Tesla',
      pricePerDay: 150,
      cities: ['Los Angeles', 'San Francisco'],
      type: 'Luxury',
      images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'],
      transmission: 'Automatic',
      fuelType: 'Electric',
      seats: 5,
      doors: 4,
      airConditioning: true,
      availability: {},
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Range Rover Sport',
      brand: 'Land Rover',
      pricePerDay: 200,
      cities: ['Miami', 'Orlando'],
      type: 'SUV',
      images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000'],
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      doors: 5,
      airConditioning: true,
      availability: {},
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Camry',
      brand: 'Toyota',
      pricePerDay: 60,
      cities: ['Chicago', 'New York'],
      type: 'Economy',
      images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1000'],
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      seats: 5,
      doors: 4,
      airConditioning: true,
      availability: {},
      createdAt: new Date().toISOString(),
    }
  ];

  let bookings = [
    { id: '1', customerName: 'John Doe', carId: '1', pickupDate: '2024-03-21', returnDate: '2024-03-25', status: 'Confirmed', totalPrice: 600, phone: '+15551234567', city: 'Los Angeles', createdAt: new Date().toISOString() },
  ];

  let cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Seattle'];
  
  let settings = {
    id: '1',
    email: 'concierge@driveselect.com',
    phone: '+1 (555) 123-4567',
    whatsapp: '+15551234561',
    address: '123 Mobility Avenue, San Francisco, CA 94103',
    addressAr: '١٢٣ شارع التنقل، سان فرانسيسكو، كاليفورنيا ٩٤١٠٣',
    updatedAt: new Date().toISOString(),
  };

  // API Routes
  app.get('/api/settings', (req, res) => {
    res.json(settings);
  });

  app.put('/api/settings', (req, res) => {
    settings = { ...settings, ...req.body, updatedAt: new Date().toISOString() };
    res.json(settings);
  });

  app.get('/api/cars', (req, res) => {
    res.json(cars);
  });

  app.post('/api/cars', (req, res) => {
    const newCar = { ...req.body, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    cars.push(newCar);
    res.status(201).json(newCar);
  });

  app.put('/api/cars/:id', (req, res) => {
    const { id } = req.params;
    cars = cars.map(c => c.id === id ? { ...c, ...req.body } : c);
    res.json(cars.find(c => c.id === id));
  });

  app.delete('/api/cars/:id', (req, res) => {
    const { id } = req.params;
    cars = cars.filter(c => c.id !== id);
    res.status(204).send();
  });

  app.get('/api/bookings', (req, res) => {
    res.json(bookings);
  });

  app.post('/api/bookings', (req, res) => {
    const { carId, pickupDate, returnDate } = req.body;

    if (new Date(pickupDate) >= new Date(returnDate)) {
      return res.status(400).json({ message: 'Return date must be after pickup date' });
    }

    // Check for overlapping bookings
    const hasOverlap = bookings.some(b => 
      b.carId === carId && 
      b.status !== 'Cancelled' &&
      ((pickupDate >= b.pickupDate && pickupDate <= b.returnDate) ||
       (returnDate >= b.pickupDate && returnDate <= b.returnDate) ||
       (pickupDate <= b.pickupDate && returnDate >= b.returnDate))
    );

    if (hasOverlap) {
      return res.status(400).json({ message: 'Car is already booked for these dates' });
    }

    const newBooking = { ...req.body, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    bookings.push(newBooking);
    res.status(201).json(newBooking);
  });

  app.patch('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    bookings = bookings.map(b => b.id === id ? { ...b, ...req.body } : b);
    res.json(bookings.find(b => b.id === id));
  });

  app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    bookings = bookings.filter(b => b.id !== id);
    res.status(204).send();
  });

  // Cities API
  app.get('/api/cities', (req, res) => {
    res.json(cities);
  });

  app.post('/api/cities', (req, res) => {
    const { name } = req.body;
    if (name && !cities.includes(name)) {
      cities.push(name);
      res.status(201).json(name);
    } else {
      res.status(400).json({ message: 'Invalid city name or city already exists' });
    }
  });

  app.delete('/api/cities/:name', (req, res) => {
    const { name } = req.params;
    cities = cities.filter(c => c !== name);
    res.status(204).send();
  });

  // Admin Auth Routes
  app.post('/api/admin/register', async (req, res) => {
    const { email, password } = req.body;
    
    if (admins.find(a => a.email === email)) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = { id: Math.random().toString(36).substr(2, 9), email, password: hashedPassword };
    admins.push(newAdmin);

    const token = jwt.sign({ id: newAdmin.id, email: newAdmin.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, admin: { id: newAdmin.id, email: newAdmin.email } });
  });

  app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    const admin = admins.find(a => a.email === email);

    if (!admin) {
      console.log(`Admin not found: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log(`Password mismatch for: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin: { id: admin.id, email: admin.email } });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
