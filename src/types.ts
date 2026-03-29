export interface Car {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number;
  cities: string[];
  type: 'SUV' | 'Sedan' | 'Economy' | 'Luxury';
  images: string[];
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  seats: number;
  doors: number;
  airConditioning: boolean;
  currency?: string;
  availability: {
    [date: string]: boolean; // date string YYYY-MM-DD
  };
  createdAt: string;
}

export interface Booking {
  id: string;
  carId: string;
  customerName: string;
  phone: string;
  city: string;
  pickupDate: string;
  returnDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  totalPrice: number;
  currency?: string;
  createdAt: string;
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  permissions?: string[];
}

export interface Settings {
  id: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  addressAr: string;
  logo?: string;
  favicon?: string;
  heroImage?: string;
  heroImageMobile?: string;
  ctaImage?: string;
  experienceImage?: string;
  currency?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  updatedAt: string;
}
