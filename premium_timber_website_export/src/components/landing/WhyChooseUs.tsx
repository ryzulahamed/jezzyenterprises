'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, ShieldCheck, Database, Truck, BadgePercent, Star } from 'lucide-react';

export default function WhyChooseUs() {
  const cards = [
    {
      icon: <Anchor className="h-6 w-6 text-amber-500" />,
      title: 'Direct Imports',
      desc: 'By sourcing directly from certified South American and African concessions, we cut out intermediary fees, passing margins to our buyers.'
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-500" />,
      title: 'Premium Quality',
      desc: 'Our logs are verified by certified graders in compliance with FEQ specifications, assuring straight trunks and maximum usable CFT.'
    },
    {
      icon: <Database className="h-6 w-6 text-amber-500" />,
      title: 'Large Inventory',
      desc: 'We maintain over 150,000 CFT of timber logs in our Tuticorin yard space, offering uninterrupted stock volumes year-round.'
    },
    {
      icon: <Truck className="h-6 w-6 text-amber-500" />,
      title: 'Reliable Delivery',
      desc: 'With custom logistics partners, we transport timber containers straight from Tuticorin Port to your warehouse anywhere in South India.'
    },
    {
      icon: <BadgePercent className="h-6 w-6 text-amber-500" />,
      title: 'Competitive Pricing',
      desc: 'We structure volume discounts for bulk manufacturers, sawmill operators, and raw timber distribution merchants.'
    },
    {
      icon: <Star className="h-6 w-6 text-amber-500" />,
      title: 'Experienced Team',
      desc: 'Backed by 15+ years of wood processing expertise, our graders advise clients on the optimal girth and length layouts for maximum yield.'
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
            Why Partner With Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display">
            The Industry Benchmark in Imported Teak
          </h2>
          <p className="text-stone-500 dark:text-zinc-400 text-xs sm:text-sm">
            We merge direct sourcing networks with rigorous quality standards to deliver premium raw materials to sawmills and woodcraft industries.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-6 rounded-3xl liquid-glass spatial-card flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold">{card.title}</h3>
                <p className="text-xs text-stone-500 dark:text-zinc-450 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
