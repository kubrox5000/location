import React from 'react';
import { motion } from 'motion/react';
import { Users, Shield, Globe, Award, CheckCircle2 } from 'lucide-react';

export const About = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Our Story</span>
          <h1 className="serif mt-4 text-5xl font-light tracking-tight text-foreground">
            Redefining the <span className="text-primary italic">Rental Experience</span>.
          </h1>
          <p className="mt-6 text-lg text-foreground/60 font-light leading-relaxed">
            Founded in 2024, DriveSelect was born from a simple idea: car rental should be as exciting as the journey itself. 
            We've built a platform that combines a premium fleet with seamless technology to give you the ultimate freedom on the road.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <h3 className="serif text-3xl font-light text-foreground">10k+</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Happy Customers</p>
            </div>
            <div>
              <h3 className="serif text-3xl font-light text-foreground">500+</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Premium Vehicles</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-[4/3] sm:aspect-square overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1000"
              alt="About Us"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-10 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-8 shadow-xl border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
                <Award size={24} />
              </div>
              <div>
                <p className="font-bold text-foreground">Award Winning</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Best Rental Service 2025</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {[
          { icon: Shield, title: 'Safety First', desc: 'Every vehicle undergoes a rigorous 100-point inspection before every rental.' },
          { icon: Users, title: 'Customer Centric', desc: 'Our support team is available 24/7 to ensure your journey is perfect.' },
          { icon: Globe, title: 'Global Reach', desc: 'With locations in every major city, we are wherever you need us to be.' },
        ].map((item, idx) => (
          <div key={idx} className="rounded-3xl border border-primary/10 bg-primary/5 p-8 transition-all hover:shadow-lg">
            <div className="mb-6 inline-block rounded-2xl bg-white p-4 text-primary shadow-sm border border-primary/10">
              <item.icon size={28} />
            </div>
            <h3 className="serif text-xl font-light text-foreground">{item.title}</h3>
            <p className="mt-4 text-sm font-light text-foreground/60 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
