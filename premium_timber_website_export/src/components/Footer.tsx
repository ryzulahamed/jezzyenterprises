'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, Clock, MapPin, ArrowUp } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = React.useState({
    brandName: 'Jezzy Enterprises',
    whatsapp: '+91 94437 14496',
    email: 'jezzyenterprises@hotmail.com',
    location: '3608/26, Dandapani Puram 2nd street, Pudukkottai - 622001'
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('timber_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({
          ...prev,
          brandName: parsed.brandName || prev.brandName,
          whatsapp: parsed.whatsapp || prev.whatsapp,
          email: parsed.email || prev.email,
          location: parsed.location || prev.location
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-100 border-t border-stone-200 dark:bg-zinc-950 dark:border-zinc-900 transition-colors duration-500 print:hidden">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-stone-200 dark:border-zinc-900">
          
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-sm font-semibold tracking-wider font-display uppercase text-amber-500">
                {settings.brandName}
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-stone-500 dark:text-zinc-450">
              {settings.brandName} — Direct importers of world-class premium teak round logs from certified sustainable forests in South America and Africa. Distributing supreme timber volume across South India.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/" className="text-stone-600 hover:text-amber-500 dark:text-zinc-300 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/stock" className="text-stone-600 hover:text-amber-500 dark:text-zinc-300 transition-colors">Stock Catalog</Link>
              </li>
              <li>
                <Link href="/#origins" className="text-stone-600 hover:text-amber-500 dark:text-zinc-300 transition-colors">Import Origins</Link>
              </li>
              <li>
                <Link href="/#about" className="text-stone-600 hover:text-amber-500 dark:text-zinc-300 transition-colors">About Story</Link>
              </li>
              <li>
                <Link href="/#faq" className="text-stone-600 hover:text-amber-500 dark:text-zinc-300 transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
              Timber Yard
            </h3>
            <ul className="space-y-3 text-xs text-stone-500 dark:text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{settings.location}, Tamilnadu, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <a href={`tel:${settings.whatsapp.replace(/\s+/g, '')}`} className="hover:text-amber-500 hover:underline transition-colors">{settings.whatsapp}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-amber-500 hover:underline transition-colors">{settings.email}</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Business Hours */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
              Operational Hours
            </h3>
            <ul className="space-y-3 text-xs text-stone-500 dark:text-zinc-450">
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-700 dark:text-zinc-300">Mon - Sat</p>
                  <p className="text-[11px] mt-0.5">9:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5 opacity-55" />
                <div>
                  <p className="font-semibold text-stone-700 dark:text-zinc-300 opacity-60">Sunday</p>
                  <p className="text-[11px] mt-0.5 text-stone-400 dark:text-zinc-600">Closed (Yard Access by Appointment Only)</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-stone-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} {settings.brandName} — Premium Timber Import & Export. All Rights Reserved. Made in Tamil Nadu, India.</p>
          <div className="flex items-center gap-6">
            <a href="/admin/login" className="hover:text-amber-500 transition-colors uppercase tracking-wider font-semibold">Staff Login</a>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-200 dark:border-zinc-900 dark:hover:bg-zinc-850 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
              title="Scroll to Top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
