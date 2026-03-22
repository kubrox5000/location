# DriveSelect - Premium Car Rental Management System

DriveSelect is a full-stack car rental management system built with React, Vite, Express, and Tailwind CSS. It features a modern, responsive UI for customers and a comprehensive admin dashboard for managing fleet, bookings, and settings.

## Features

- **Multilingual Support**: Full support for English, Arabic, and French with RTL/LTR layout switching.
- **Dynamic Fleet Management**: Admins can add, edit, and delete vehicles with details like brand, price, transmission, and fuel type.
- **Booking System**: Customers can book cars via a website form or directly through WhatsApp.
- **Admin Dashboard**: Real-time stats, booking management, and availability tracking.
- **City Management**: Easily manage locations where services are available.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Express.js, JWT for authentication, Bcrypt for password hashing.
- **Internationalization**: i18next, react-i18next.
- **State Management**: React Hooks.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kubrox5000/Rent-car.git
   cd Rent-car
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your `JWT_SECRET`.

### Running the App

To start the development server (both frontend and backend):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The static files will be generated in the `dist` directory.

## Admin Access

Default admin credentials (can be changed in `server.ts`):
- **Email**: `admin@driveselect.com`
- **Password**: `admin123`

## License

MIT
