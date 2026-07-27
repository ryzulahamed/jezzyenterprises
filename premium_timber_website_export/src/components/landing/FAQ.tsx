'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: 1,
    question: "What grades of teak wood logs do you import?",
    answer: "We primarily import First Export Quality (FEQ) teak wood round logs. We also supply select A-Grade and B-Grade logs based on client requirements. All logs are certified, plantation-grown, and graded strictly by dimensions, grain straightness, and defects density."
  },
  {
    id: 2,
    question: "Can I inspect the timber logs directly at your yards?",
    answer: "Yes, absolutely. We welcome sawmill owners, furniture manufacturers, and bulk timber dealers to visit our headquarters and regional office (Taj Timbers) at 3608/26, Dandapani Puram 2nd street in Pudukkottai, Tamilnadu, or perform physical stock inspections at our Tuticorin yard space. Inspections are available from Monday to Saturday, 9:00 AM to 6:00 PM."
  },
  {
    id: 3,
    question: "How do you calculate CFT volume and logs dimensions?",
    answer: "We calculate volumes using standard international timber log girth/diameter formulas. Every container list details individual logs counts, average length (feet), average diameter (cm), moisture content percentage, and total Volume in Cubic Feet (CFT) to provide complete billing transparency."
  },
  {
    id: 4,
    question: "Do you manage shipping and customs clearance directly?",
    answer: "Yes. We manage the entire logistics lifecycle. Logs are loaded directly from ports in South America (Ecuador, Panama, Brazil) and Africa (Ghana, Tanzania) and arrive at the Port of Chennai. From Chennai, we handle transport logistics directly to your yard in Tamil Nadu, Karnataka, Kerala, or Andhra Pradesh."
  },
  {
    id: 5,
    question: "How can I reserve a container and what is the process?",
    answer: "You can reserve a container by selecting 'View Available Stock', choosing a specific container ID, and submitting an inquiry. Our sales office will contact you to review specifications and draft a reservation. Reservations are held for a standard period pending deposit clearance."
  }
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white text-stone-900 dark:bg-black dark:text-zinc-100 transition-colors duration-500 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
            Support Center
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {FAQS_DATA.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-3xl liquid-glass spatial-card liquid-glow overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-medium text-stone-900 dark:text-zinc-100 cursor-pointer text-xs sm:text-sm tactile-bounce"
                >
                  <span>{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown className="h-4 w-4 text-amber-500" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-stone-500 dark:text-zinc-400 leading-relaxed border-t border-stone-150 dark:border-zinc-900 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
