import React from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, CreditCard, Key, ArrowRight } from 'lucide-react';

export const HowToBook = () => {
  const steps = [
    {
      icon: Search,
      title: 'Find Your Perfect Car',
      desc: 'Browse our extensive fleet of premium vehicles. Filter by type, brand, or city to find the one that fits your needs.',
    },
    {
      icon: Calendar,
      title: 'Select Your Dates',
      desc: 'Choose your pickup and return dates. Our real-time availability system ensures your car is ready when you are.',
    },
    {
      icon: CreditCard,
      title: 'Book Online or via WhatsApp',
      desc: 'Complete our secure online form or chat directly with our team on WhatsApp for a personalized experience.',
    },
    {
      icon: Key,
      title: 'Pick Up & Drive',
      desc: 'Head to your selected location, grab the keys, and start your adventure. It is that simple!',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Process</span>
        <h1 className="serif mt-4 text-5xl font-light tracking-tight text-foreground">How to Book Your Ride</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/60 font-light leading-relaxed">
          Booking a car with DriveSelect is designed to be as smooth as the cars we rent. 
          Follow these simple steps to get on the road.
        </p>
      </div>

      <div className="mt-20 relative">
        {/* Connection Line */}
        <div className="absolute left-1/2 top-0 hidden h-full w-0.5 bg-primary/10 md:block" />

        <div className="space-y-20">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative flex flex-col items-center gap-8 md:flex-row ${
                idx % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1 md:text-right">
                <div className={`flex flex-col ${idx % 2 !== 0 ? 'md:items-start' : 'md:items-end'}`}>
                  <h3 className="serif text-2xl font-light text-foreground">{step.title}</h3>
                  <p className="mt-4 text-sm font-light text-foreground/60 leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
                <step.icon size={28} />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-white text-[10px] font-bold">
                  0{idx + 1}
                </div>
              </div>

              <div className="flex-1">
                {/* Empty space for layout balance */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-32 rounded-[40px] bg-primary p-12 text-center text-primary-foreground">
        <h2 className="serif text-3xl font-light">Still have questions?</h2>
        <p className="mt-4 opacity-60">Our team is ready to help you with any part of the process.</p>
        <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-primary transition-all hover:bg-primary-foreground hover:text-primary active:scale-95">
          Contact Support
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
