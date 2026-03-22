import { Car } from './types';

export const CAR_TYPES = ['SUV', 'Sedan', 'Economy', 'Luxury'] as const;

export const SAMPLE_CARS: Car[] = [
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
    cities: ['Miami', 'Seattle'],
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
