import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface Country {
  id: string;
  name: string;
  flag: string;
  description: string;
  frequency: string;
  woodSpecies: string[];
  image: string;
  enabled: boolean;
}

// Seed Initial Countries Data
const SEED_COUNTRIES: Country[] = [
  { id: 'c-1', name: 'Ecuador', flag: '🇪🇨', description: 'Uniform grain, minimal defects, plantation teak.', frequency: 'Bi-weekly', woodSpecies: ['Teak Wood'], image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80', enabled: true },
  { id: 'c-2', name: 'Brazil', flag: '🇧🇷', description: 'Certified sustainable high-density teak.', frequency: 'Monthly', woodSpecies: ['Teak Wood'], image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', enabled: true },
  { id: 'c-3', name: 'Panama', flag: '🇵🇦', description: 'Rich dark grain highlights.', frequency: 'Monthly', woodSpecies: ['Teak Wood'], image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80', enabled: true },
  { id: 'c-4', name: 'Ghana', flag: '🇬🇭', description: 'High weather resilience West African Teak.', frequency: 'Bi-weekly', woodSpecies: ['Teak Wood'], image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80', enabled: true },
  { id: 'c-5', name: 'Tanzania', flag: '🇹🇿', description: 'Dense ring configuration, high oil content.', frequency: 'Monthly', woodSpecies: ['Teak Wood'], image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80', enabled: true },
  { id: 'c-6', name: 'Costa Rica', flag: '🇨🇷', description: 'Premium eco-plantation teak with consistent rings.', frequency: 'Bi-weekly', woodSpecies: ['Teak Wood'], image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80', enabled: true },
  { id: 'c-7', name: 'Guatemala', flag: '🇬🇹', description: 'Rich golden colors, harvested from managed high-soil zones.', frequency: 'Monthly', woodSpecies: ['Teak Wood'], image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', enabled: true }
];

// Seed Initial Inventory Data
const SEED_CONTAINERS: any[] = [
  {
    id: 'ECU-88291',
    container_number: 'ECU-88291',
    countryId: 'c-1', // Ecuador
    portLoading: 'Port of Guayaquil',
    portArrival: 'Tuticorin Port',
    species: 'Teak Wood',
    size: '40ft',
    logsCount: 140,
    minLength: 12,
    maxLength: 24,
    avgLength: 18,
    minDiameter: 25,
    maxDiameter: 45,
    avgDiameter: 34,
    cft: 940,
    grade: 'FEQ',
    ratePerCft: 3670,
    lengthUnit: 'ft',
    girthUnit: 'cm',
    cbm: 26.618,
    warehouse: 'Tuticorin yard space',
    arrivalDate: '2026-06-15',
    price: 3450000,
    description: 'Outstanding shipment of First Export Quality (FEQ) teak round logs from Ecuador. The logs exhibit deep golden colors, highly centered heartwood, straight growth structure, and minimal surface knots. Perfectly conditioned in transit with moisture content averaging 12%. Ideal for premium flooring, marine decking, and luxury indoor furniture.',
    specialNotes: 'No signs of sapwood decay. Double-inspected at port of loading.',
    status: 'available',
    isDraft: false,
    images: [
      'https://images.unsplash.com/photo-1546482502-0dfb4398c88f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'BRA-99104',
    container_number: 'BRA-99104',
    countryId: 'c-2', // Brazil
    portLoading: 'Port of Paranagua',
    portArrival: 'Tuticorin Port',
    species: 'Teak Wood',
    size: '40ft',
    logsCount: 120,
    minLength: 14,
    maxLength: 22,
    avgLength: 16.5,
    minDiameter: 28,
    maxDiameter: 42,
    avgDiameter: 36,
    cft: 880,
    grade: 'Grade A',
    ratePerCft: 3522,
    lengthUnit: 'ft',
    girthUnit: 'cm',
    cbm: 24.919,
    warehouse: 'Tuticorin yard space',
    arrivalDate: '2026-06-20',
    price: 3100000,
    description: 'High-density plantation teak logs sourced from Mato Grosso, Brazil. Excellent girth layout, providing straight and clean grain cuts with uniform oil distribution. Certified sustainable cargo.',
    status: 'available',
    isDraft: false,
    images: [
      'https://images.unsplash.com/photo-1541535881962-e668f28b47da?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'PAN-22194',
    container_number: 'PAN-22194',
    countryId: 'c-3', // Panama
    portLoading: 'Port of Balboa',
    portArrival: 'Tuticorin Port',
    species: 'Teak Wood',
    size: '20ft',
    logsCount: 90,
    minLength: 10,
    maxLength: 18,
    avgLength: 14,
    minDiameter: 22,
    maxDiameter: 38,
    avgDiameter: 32,
    cft: 420,
    grade: 'Grade B',
    ratePerCft: 3690,
    lengthUnit: 'ft',
    girthUnit: 'cm',
    cbm: 11.893,
    warehouse: 'Tuticorin Port Transit Yard',
    arrivalDate: '2026-06-22',
    price: 1550000,
    description: 'Canal Zone Panama teak round logs. Showcases rich dark stripes that add high contrast aesthetics, perfect for specialty paneling and wood carving crafts.',
    status: 'reserved',
    isDraft: false,
    images: [
      'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'GHA-55102',
    container_number: 'GHA-55102',
    countryId: 'c-4', // Ghana
    portLoading: 'Port of Tema',
    portArrival: 'Tuticorin Port',
    species: 'Teak Wood',
    size: '40ft',
    logsCount: 150,
    minLength: 16,
    maxLength: 26,
    avgLength: 20,
    minDiameter: 26,
    maxDiameter: 48,
    avgDiameter: 38,
    cft: 980,
    grade: 'FEQ',
    ratePerCft: 3673,
    lengthUnit: 'ft',
    girthUnit: 'cm',
    cbm: 27.751,
    warehouse: 'Tuticorin yard space',
    arrivalDate: '2026-06-08',
    price: 3600000,
    description: 'Dry-forest West African teak logs. Extremely low water content minimizes shrinkage or structural splitting during sawing, promising superb factory yields.',
    status: 'sold',
    isDraft: false,
    images: [
      'https://images.unsplash.com/photo-1422207234024-7abf1772226c?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'TZA-44183',
    container_number: 'TZA-44183',
    countryId: 'c-5', // Tanzania
    portLoading: 'Port of Dar es Salaam',
    portArrival: 'Tuticorin Port',
    species: 'Teak Wood',
    size: '40ft',
    logsCount: 130,
    minLength: 14,
    maxLength: 24,
    avgLength: 18,
    minDiameter: 25,
    maxDiameter: 44,
    avgDiameter: 35,
    cft: 920,
    grade: 'Grade A',
    ratePerCft: 3532,
    lengthUnit: 'ft',
    girthUnit: 'cm',
    cbm: 26.051,
    warehouse: 'Tuticorin yard space',
    arrivalDate: '2026-06-25',
    price: 3250000,
    description: 'East African Teak with high natural oil distribution and rich bronze hues. Highly straight logs with robust ring densities reflecting premium slow-growth patterns.',
    status: 'available',
    isDraft: false,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const inventoryService = {
  
  // Local storage initialization
  initLocalStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('timber_inventory_countries')) {
      localStorage.setItem('timber_inventory_countries', JSON.stringify(SEED_COUNTRIES));
    }
    if (!localStorage.getItem('timber_inventory_containers')) {
      localStorage.setItem('timber_inventory_containers', JSON.stringify(SEED_CONTAINERS));
    }
  },

  // 1. COUNTRIES CRUD
  async getCountries(): Promise<Country[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .eq('enabled', true);
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getCountries fallback:', err);
      }
    }
    this.initLocalStorage();
    const str = typeof window !== 'undefined' ? localStorage.getItem('timber_inventory_countries') || '[]' : '[]';
    return JSON.parse(str).filter((c: any) => c.enabled);
  },

  // 2. INVENTORY CRUD
  async getContainers(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
      
          .from('containers')
          .select('*, countries(name, flag)')
          .is('deleted_at', null);
        console.log("Supabase data:",data);
        console.log("Supabase error:",error);
        if (!error && data) {
          return data.map((item:any) => ({
            ...item,
            countryName: item.countries?.name || '',
            countryFlag: item.countries?.flag || '',
            logsCount: item.logs_count,
            minLength: item.min_length,
            maxLength: item.max_length,
            avgLength: item.avg_length,
            minDiameter: item.min_diameter,
            maxDiameter: item.max_diameter,
            avgDiameter: item.avg_diameter,
            arrivalDate: item.arrival_date,
            specialNotes: item.special_notes,
            isDraft: item.is_draft,
            lengthUnit: item.length_unit || 'ft',
            girthUnit: item.girth_unit || 'cm',
            cbm: item.cbm || parseFloat((item.cft / 35.3147).toFixed(3))
          }));
        }
      } catch (err) {
        console.warn('Supabase getContainers fallback:', err);
      }
    }
    this.initLocalStorage();
    const str = typeof window !== 'undefined' ? localStorage.getItem('timber_inventory_containers') || '[]' : '[]';
    const containers = JSON.parse(str) || [];
    const countries = await this.getCountries();
    
    // Map country descriptions into cards
    return (containers || []).map((c: any) => {
      const match = countries.find(co => 
        co.id === c.countryId || 
        co.name.toLowerCase() === (c.countryId || '').trim().toLowerCase()
      );
      // Automatically translate legacy 'Pudukkottai Main Yard' values to 'Tuticorin yard space'
      const warehouse = c.warehouse === 'Pudukkottai Main Yard' ? 'Tuticorin yard space' : c.warehouse;
      return {
        ...c,
        warehouse,
        countryName: match ? match.name : c.countryId || 'Unknown',
        countryFlag: match ? match.flag : '🌐'
      };
    });
  },

  async getContainerById(id: string): Promise<any | null> {
    const list = await this.getContainers();
    if (!id) return null;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const rawId = id.trim().toLowerCase();
    return list.find(item => {
      const itemId = (item.id || '').trim().toLowerCase();
      const itemNum = (item.container_number || '').trim().toLowerCase();
      return itemId === cleanId || itemNum === cleanId || itemId === rawId || itemNum === rawId;
    }) || null;
  },

  async ensureCountryExists(rawCountryName: string): Promise<string> {
    if (!rawCountryName || !rawCountryName.trim()) return '';
    const cleanName = rawCountryName.trim();
    
    // Check existing countries
    const existingCountries = await this.getCountries();
    const found = existingCountries.find(
      c => c.name.toLowerCase() === cleanName.toLowerCase() || c.id === cleanName
    );
    
    if (found) {
      return found.id;
    }
    
    // Auto-register new origin country into the system registry!
    const newCountryId = `c-dyn-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newCountryObj: Country = {
      id: newCountryId,
      name: cleanName,
      flag: '🌐',
      description: `Direct imported timber from ${cleanName}.`,
      frequency: 'On Demand',
      woodSpecies: ['Teak Wood'],
      image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80',
      enabled: true
    };
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('countries')
          .insert([{ id: newCountryId, name: cleanName, flag: '🌐', description: newCountryObj.description, enabled: true }])
          .select()
          .single();
        if (!error && data) return data.name;
      } catch (err) {
        console.warn('Auto-registering country in DB failed:', err);
      }
    }
    
    // Local storage auto-register
    if (typeof window !== 'undefined') {
      const storedStr = localStorage.getItem('timber_inventory_countries') || '[]';
      const storedList = JSON.parse(storedStr);
      storedList.push(newCountryObj);
      localStorage.setItem('timber_inventory_countries', JSON.stringify(storedList));
    }
    
    return cleanName;
  },

  async addContainer(container: any): Promise<any> {
    const registeredCountryName = await this.ensureCountryExists(container.countryId);
    const countryVal = registeredCountryName || container.countryId;
    console.log("registeredCountryName=",registeredCountryName);
    console.log("container.countryld=",container.countryld);
    console.log("countryVal=",countryVal);

    const parseDbNum = (val: any): number => {
      if (val === undefined || val === null || val === '') return 0;
      if (typeof val === 'number') return val;
      const num = parseFloat(val.toString().trim());
      return isNaN(num) ? 0 : num;
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const {
  data: { session },
} = await supabase.auth.getSession();

console.log("SESSION:", session);
console.log("USER:", session?.user);
        const dbRow = {
          container_number: container.container_number,
          country_id: countryVal,
          port_loading: container.portLoading,
          port_arrival: container.portArrival,
          species: container.species,
          size: container.size,
          logs_count: parseDbNum(container.logsCount),
          min_length: parseDbNum(container.minLength),
          max_length: parseDbNum(container.maxLength),
          avg_length: parseDbNum(container.avgLength),
          min_diameter: parseDbNum(container.minDiameter),
          max_diameter: parseDbNum(container.maxDiameter),
          avg_diameter: parseDbNum(container.avgDiameter),
          cft: parseDbNum(container.cft),
          grade: container.grade,
          rate_per_cft: parseDbNum(container.ratePerCft),
          length_unit: container.lengthUnit || 'ft',
          girth_unit: container.girthUnit || 'cm',
          cbm: parseDbNum(container.cbm),
          warehouse: container.warehouse,
          arrival_date: container.arrivalDate,
          price: parseDbNum(container.price),
          description: container.description,
          special_notes: container.specialNotes,
          status: container.status,
          is_draft: container.isDraft,
          images: container.images || []
        };

        const { data, error } = await supabase
          .from('containers')
          .insert([dbRow])
          .select()
          .single();
          console.log("INSERT DATA:", data);
console.log("INSERT ERROR:", error);
console.log("ERROR CODE:", error?.code);
console.log("ERROR MESSAGE:", error?.message);
        
        if (!error && data) {
          // Sync into local cache
          this.initLocalStorage();
          const str = typeof window !== 'undefined' ? localStorage.getItem('timber_inventory_containers') || '[]' : '[]';
          const list = JSON.parse(str) || [];
          list.push({ ...container, countryId: countryVal, id: container.container_number });
          if (typeof window !== 'undefined') localStorage.setItem('timber_inventory_containers', JSON.stringify(list));
          this.addActivityLog('CREATE_CONTAINER', `Created container ${container.container_number}`);
          return data;
        }
      } catch (err) {
        console.warn('Supabase addContainer fallback to local storage:', err);
      }
    }

    this.initLocalStorage();
    const str = typeof window !== 'undefined' ? localStorage.getItem('timber_inventory_containers') || '[]' : '[]';
    const list = JSON.parse(str) || [];
    const newContainer = {
      ...container,
      countryId: countryVal,
      id: container.container_number,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newContainer);
    if (typeof window !== 'undefined') {
      localStorage.setItem('timber_inventory_containers', JSON.stringify(list));
    }
    
    // Auto insert an activity log
    this.addActivityLog('CREATE_CONTAINER', `Created container ${container.container_number}`);
    return newContainer;
  },

  async updateContainer(id: string, updates: any): Promise<any> {
    let countryVal = updates.countryId;
    if (updates.countryId) {
      const registeredCountryName = await this.ensureCountryExists(updates.countryId);
      countryVal = registeredCountryName || updates.countryId;
    }

    const parseDbNum = (val: any): number => {
      if (val === undefined || val === null || val === '') return 0;
      if (typeof val === 'number') return val;
      const num = parseFloat(val.toString().trim());
      return isNaN(num) ? 0 : num;
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = {
          container_number: updates.container_number,
          country_id: countryVal,
          port_loading: updates.portLoading,
          port_arrival: updates.portArrival,
          species: updates.species,
          size: updates.size,
          logs_count: parseDbNum(updates.logsCount),
          min_length: parseDbNum(updates.minLength),
          max_length: parseDbNum(updates.maxLength),
          avg_length: parseDbNum(updates.avgLength),
          min_diameter: parseDbNum(updates.minDiameter),
          max_diameter: parseDbNum(updates.maxDiameter),
          avg_diameter: parseDbNum(updates.avgDiameter),
          cft: parseDbNum(updates.cft),
          grade: updates.grade,
          rate_per_cft: parseDbNum(updates.ratePerCft),
          length_unit: updates.lengthUnit || 'ft',
          girth_unit: updates.girthUnit || 'cm',
          cbm: parseDbNum(updates.cbm),
          warehouse: updates.warehouse,
          arrival_date: updates.arrivalDate,
          price: parseDbNum(updates.price),
          description: updates.description,
          special_notes: updates.specialNotes,
          status: updates.status,
          is_draft: updates.isDraft,
          images: updates.images
        };

        const { data, error } = await supabase
          .from('containers')
          .update(dbRow)
          .or(`id.eq.${id},container_number.eq.${id}`)
          .select();

        if (!error && data && data.length > 0) {
          this.initLocalStorage();
          const str = typeof window !== 'undefined' ? localStorage.getItem('timber_inventory_containers') || '[]' : '[]';
          const list = JSON.parse(str) || [];
          const idx = list.findIndex((c: any) => c.id?.toLowerCase() === id?.toLowerCase() || c.container_number?.toLowerCase() === id?.toLowerCase());
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
            if (typeof window !== 'undefined') localStorage.setItem('timber_inventory_containers', JSON.stringify(list));
          }
          return data[0];
        }
      } catch (err) {
        console.warn('Supabase updateContainer fallback to local storage:', err);
      }
    }

    this.initLocalStorage();
    const str = typeof window !== 'undefined' ? localStorage.getItem('timber_inventory_containers') || '[]' : '[]';
    const list = JSON.parse(str) || [];
    const idx = list.findIndex((c: any) => c.id?.toLowerCase() === id?.toLowerCase() || c.container_number?.toLowerCase() === id?.toLowerCase());
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...updates,
        id: updates.container_number || list[idx].id,
        container_number: updates.container_number || list[idx].container_number,
        countryId: countryVal || updates.countryId || list[idx].countryId,
        countryName: countryVal || updates.countryId || list[idx].countryName,
        ratePerCft: updates.ratePerCft !== undefined ? updates.ratePerCft : list[idx].ratePerCft,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('timber_inventory_containers', JSON.stringify(list));
      this.addActivityLog('UPDATE_CONTAINER', `Updated specifications for container ${id}`);
      return list[idx];
    }
    throw new Error('Container not found');
  },

  async deleteContainer(id: string): Promise<boolean> {
    const cleanId = (id || '').trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('containers')
          .update({ deleted_at: new Date().toISOString() })
          .or(`id.eq.${id},container_number.eq.${id}`);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    this.initLocalStorage();
    const str = typeof window !== 'undefined' ? localStorage.getItem('timber_inventory_containers') || '[]' : '[]';
    const list = JSON.parse(str) || [];
    const filtered = list.filter((c: any) => {
      const cId = (c.id || '').trim().toLowerCase();
      const cNum = (c.container_number || '').trim().toLowerCase();
      return cId !== cleanId && cNum !== cleanId;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('timber_inventory_containers', JSON.stringify(filtered));
    }

    this.addActivityLog('DELETE_CONTAINER', `Deleted container ${id} from catalog`);
    return true;
  },

  // 3. INQUIRIES & RESERVATIONS CRM ACCESS
  async getInquiries(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((item:any) => ({
            ...item,
            customerName: item.customer_name || item.name,
            companyName: item.company_name,
            containerId: item.container_id,
            date: item.created_at?.split('T')[0] || item.date
          }));
        }
      } catch (err) {
        console.warn('Supabase inquiries fetch fallback:', err);
      }
    }

    this.initLocalStorage();
    if (typeof window === 'undefined') return [];
    const str = localStorage.getItem('timber_mock_inquiries');
    if (str === null) {
      const seedInqs = [
        {
          id: 'inq-1',
          name: 'Rajesh Sawmills',
          phone: '919443567890',
          email: 'rajesh@sawmills.com',
          message: 'Interested in reserving 3 containers of Ecuador FEQ Teak round logs. Please share details of shipping logs dimensions.',
          status: 'new',
          date: '2026-06-25'
        },
        {
          id: 'inq-2',
          name: 'Coimbatore Furnitures',
          phone: '919842112233',
          email: 'purchase@coimbatorefurn.in',
          message: 'Need urgent price quote for 2 containers of Tanzania Teak. Range specs: Length 14-22 ft, Girth 36 cm.',
          status: 'in_progress',
          date: '2026-06-26'
        }
      ];
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(seedInqs));
      return seedInqs;
    }
    return JSON.parse(str || '[]');
  },

  async addInquiry(inquiry: any): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = {
          customer_name: inquiry.customerName || inquiry.name,
          company_name: inquiry.companyName || inquiry.company,
          phone: inquiry.phone,
          email: inquiry.email,
          city: inquiry.city,
          container_id: inquiry.containerId,
          message: inquiry.message,
          status: inquiry.status || 'new'
        };
        const { data, error } = await supabase
          .from('inquiries')
          .insert([dbRow])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase add inquiry fallback:', err);
      }
    }

    this.initLocalStorage();
    const str = localStorage.getItem('timber_mock_inquiries') || '[]';
    const list = JSON.parse(str);
    list.unshift(inquiry);
    localStorage.setItem('timber_mock_inquiries', JSON.stringify(list));
    return inquiry;
  },

  async updateInquiryStatus(id: string, status: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('inquiries')
          .update({ status })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update inquiry error:', err);
      }
    }

    const list = await this.getInquiries();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(list));
      this.addActivityLog('UPDATE_INQUIRY', `Marked inquiry ${id} status to ${status}`);
    }
  },

  async getReservations(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((item:any) => ({
            ...item,
            containerId: item.container_id,
            customerName: item.customer_name,
            companyName: item.company_name,
            date: item.created_at?.split('T')[0] || item.date
          }));
        }
      } catch (err) {
        console.warn('Supabase reservations fetch fallback:', err);
      }
    }

    this.initLocalStorage();
    if (typeof window === 'undefined') return [];
    const str = localStorage.getItem('timber_mock_reservations');
    if (str === null) {
      const seedRes = [
        {
          id: 'res-99',
          containerId: 'PAN-22194',
          customerName: 'Meera Krishnan',
          companyName: 'Studio D-Arc Landscapes',
          phone: '919845012345',
          email: 'meera@darc.com',
          city: 'Bangalore',
          date: '2026-06-22',
          status: 'approved'
        }
      ];
      localStorage.setItem('timber_mock_reservations', JSON.stringify(seedRes));
      return seedRes;
    }
    return JSON.parse(str || '[]');
  },

  async updateReservationStatus(id: string, status: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('reservations')
          .update({ status })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update reservation error:', err);
      }
    }

    const list = await this.getReservations();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      const res = list[idx];
      res.status = status;
      localStorage.setItem('timber_mock_reservations', JSON.stringify(list));
      
      // Auto synchronize container status
      if (status === 'approved') {
        await this.updateContainerStatus(res.containerId, 'reserved');
      } else if (status === 'rejected' || status === 'cancelled') {
        await this.updateContainerStatus(res.containerId, 'available');
      } else if (status === 'paid' || status === 'delivered') {
        await this.updateContainerStatus(res.containerId, 'sold');
      }
      this.addActivityLog('UPDATE_RESERVATION', `Approved/Updated reservation status for container ${res.containerId} to ${status}`);
    }
  },

  async updateContainerStatus(containerId: string, status: 'available' | 'reserved' | 'sold'): Promise<void> {
    const list = JSON.parse(localStorage.getItem('timber_inventory_containers') || '[]');
    const idx = list.findIndex((c: any) => c.id === containerId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem('timber_inventory_containers', JSON.stringify(list));
    }
  },

  // 4. ACTIVITY LOGS AUDITING
  addActivityLog(action: string, details: string) {
    if (typeof window === 'undefined') return;
    const str = localStorage.getItem('timber_activity_logs') || '[]';
    const logs = JSON.parse(str);
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'Rayan Kalia'
    });
    localStorage.setItem('timber_activity_logs', JSON.stringify(logs.slice(0, 100))); // Keep last 100
  },

  async getActivityLogs(): Promise<any[]> {
    if (typeof window === 'undefined') return [];
    const str = localStorage.getItem('timber_activity_logs') || '[]';
    const logs = JSON.parse(str);
    if (logs.length === 0) {
      const seedLogs = [
        { id: 'log-1', action: 'PUBLISH_DRAFT', details: 'Published container ECU-88291', timestamp: '2026-06-25T10:14:22Z', user: 'Rayan Kalia' },
        { id: 'log-2', action: 'UPDATE_STATUS', details: 'Approved reservation for container PAN-22194', timestamp: '2026-06-26T14:32:11Z', user: 'Sundar Pillai' }
      ];
      localStorage.setItem('timber_activity_logs', JSON.stringify(seedLogs));
      return seedLogs;
    }
    return logs;
  }
};
