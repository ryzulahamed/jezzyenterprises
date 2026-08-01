'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '../../../../services/inventoryService';
import { ArrowLeft, Save, Upload, X, HelpCircle, AlertCircle, CheckCircle, Star, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

const parseRangeVal = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = val.toString().trim();
  if (str.includes('-')) {
    const parts = str.split('-').map((p: string) => parseFloat(p.trim())).filter((n: number) => !isNaN(n));
    if (parts.length >= 2) return (parts[0] + parts[1]) / 2;
    if (parts.length === 1) return parts[0];
  }
  return parseFloat(str) || 0;
};

const parseOrKeepRange = (val: any) => {
  if (val === undefined || val === null || val === '') return '';
  const str = val.toString().trim();
  if (str.includes('-')) return str;
  const num = parseFloat(str);
  return isNaN(num) ? str : num;
};

export default function AddContainerPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    container_number: '',
    countryId: '',
    portLoading: '',
    portArrival: 'Tuticorin Port',
    species: 'Teak Wood',
    size: '40ft' as '20ft' | '40ft',
    logsCount: '' as any,
    minLength: '' as any,
    maxLength: '' as any,
    avgLength: '' as any,
    minDiameter: '' as any,
    maxDiameter: '' as any,
    avgDiameter: '' as any,
    cft: '' as any,
    grade: 'FEQ',
    warehouse: 'Tuticorin Port Transit Yard',
    arrivalDate: new Date().toISOString().split('T')[0],
    ratePerCft: '' as any,
    price: '' as any,
    description: '',
    specialNotes: '',
    status: 'available' as 'available' | 'reserved' | 'sold',
    isDraft: false,
    lengthUnit: 'ft',
    girthUnit: 'cm',
    cbm: '' as any
  });

  useEffect(() => {
    const cftVal = parseRangeVal(formData.cft);
    const rateVal = parseRangeVal(formData.ratePerCft);
    if (cftVal && rateVal && !formData.price) {
      setFormData(prev => ({ ...prev, price: Math.round(cftVal * rateVal).toString() }));
    }
  }, [formData.cft, formData.ratePerCft]);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoCalculateCft, setAutoCalculateCft] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image')) {
      alert('Please enter a valid HTTP/HTTPS image URL link.');
      return;
    }
    setImagePreviews(prev => [...prev, url]);
    setImageUrlInput('');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImagePreviews(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  useEffect(() => {
    const fetchCountries = async () => {
      const list = await inventoryService.getCountries();
      setCountries(list);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (autoCalculateCft) {
      const lengthVal = parseRangeVal(formData.avgLength);
      const girthVal = parseRangeVal(formData.avgDiameter);
      const countVal = parseRangeVal(formData.logsCount);
      
      let lengthInFeet = lengthVal;
      if (formData.lengthUnit === 'm') {
        lengthInFeet = lengthVal * 3.28084;
      } else if (formData.lengthUnit === 'cm') {
        lengthInFeet = lengthVal / 30.48;
      } else if (formData.lengthUnit === 'in') {
        lengthInFeet = lengthVal / 12;
      }

      let girthInInches = girthVal;
      if (formData.girthUnit === 'cm') {
        girthInInches = girthVal / 2.54;
      } else if (formData.girthUnit === 'm') {
        girthInInches = girthVal * 39.3701;
      } else if (formData.girthUnit === 'ft') {
        girthInInches = girthVal * 12;
      } else if (formData.girthUnit === 'in') {
        girthInInches = girthVal;
      }

      const volumePerLog = Math.pow(girthInInches / 4, 2) * lengthInFeet / 144;
      const calculatedCft = volumePerLog * countVal;
      const calculatedCbm = calculatedCft / 35.3147;
      
      setFormData(prev => ({
        ...prev,
        cft: calculatedCft.toFixed(2),
        cbm: calculatedCbm.toFixed(3)
      }));
    }
  }, [
    formData.avgLength, 
    formData.avgDiameter, 
    formData.logsCount, 
    formData.lengthUnit, 
    formData.girthUnit, 
    autoCalculateCft
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setUploadProgress(10);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(timer);
          
          const previewsPromises = imageFiles.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          });

          Promise.all(previewsPromises).then(urls => {
            setImagePreviews(prevList => [...prevList, ...urls]);
            setUploadProgress(null);
          });
          
          return null;
        }
        return prev + 30;
      });
    }, 150);
  };

  const removePreviewImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSave = async (isDraftMode: boolean) => {
    setLoading(true);
    setErrorMessage(null);

    const serialId = formData.container_number.trim();
    if (!serialId) {
      setErrorMessage('Please enter a unique Container ID.');
      setLoading(false);
      return;
    }

    if (!isDraftMode && !formData.countryId) {
      setErrorMessage('Please select an Origin Country before publishing live stock.');
      setLoading(false);
      return;
    }

    try {
      const existing = await inventoryService.getContainerById(serialId);
      if (existing) {
        setErrorMessage(`A container with Serial ID "${serialId}" already exists in the inventory.`);
        setLoading(false);
        return;
      }

      const submission = {
        ...formData,
        isDraft: isDraftMode,
        logsCount: parseOrKeepRange(formData.logsCount),
        avgLength: parseOrKeepRange(formData.avgLength),
        avgDiameter: parseOrKeepRange(formData.avgDiameter),
        cft: parseOrKeepRange(formData.cft),
        cbm: parseOrKeepRange(formData.cbm),
        ratePerCft: parseOrKeepRange(formData.ratePerCft),
        price: formData.price ? parseOrKeepRange(formData.price) : undefined,
        images: imagePreviews.length > 0 ? imagePreviews : [
          'https://images.unsplash.com/photo-1546482502-0dfb4398c88f?auto=format&fit=crop&w=800&q=80'
        ]
      };

      await inventoryService.addContainer(submission);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/inventory');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register container.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 md:p-10 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-200 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/inventory')}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Add New Container</h1>
            <p className="text-xs text-stone-500 dark:text-zinc-450 mt-0.5">
              Register vessel shipping specs, CFT log measurements, and storage yard allocations.
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 text-xs font-semibold">
          <CheckCircle className="h-5 w-5" />
          <span>Container saved successfully! Redirecting to ledger...</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Grid */}
      <form noValidate onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: General specs inputs (x: 8cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900 shadow-sm space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 dark:border-zinc-850">
              Technical Specifications
            </h3>

            {/* Row 1: ID & Origin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Container Serial ID *</label>
                <input
                  type="text"
                  required
                  value={formData.container_number}
                  onChange={(e) => setFormData({ ...formData, container_number: e.target.value.toUpperCase() })}
                  placeholder="e.g., ECU-88902"
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Origin Country *</label>
                <div className="space-y-2">
                  <select
                    value={countries.some(co => co.name.toLowerCase() === (formData.countryId || '').toLowerCase()) ? formData.countryId : 'CUSTOM'}
                    onChange={(e) => {
                      if (e.target.value !== 'CUSTOM') {
                        setFormData({ ...formData, countryId: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 text-stone-850 dark:text-zinc-200 cursor-pointer font-medium"
                  >
                    <option value="">-- Quick Select Country --</option>
                    {countries.map(co => (
                      <option key={co.id} value={co.id}>{co.flag || '🌐'} {co.name}</option>
                    ))}
                    <option value="CUSTOM">✏️ Custom / Other Origin Country...</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={formData.countryId}
                    onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                    placeholder="Origin Country (e.g. Uzbekistan, Ghana, Brazil)..."
                    className="w-full px-3 py-2 border border-stone-200 bg-white rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 font-semibold text-stone-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Storage Yard & Arrival Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Storage Yard Location</label>
                <input
                  list="warehouses"
                  type="text"
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 text-stone-855 dark:text-zinc-200"
                />
                <datalist id="warehouses">
                  <option value="Tuticorin Port Transit Yard" />
                  <option value="Tuticorin yard space" />
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Arrival Date *</label>
                <input
                  type="date"
                  required
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  onClick={(e) => {
                    try {
                      (e.target as any).showPicker?.();
                    } catch (err) {
                      console.warn(err);
                    }
                  }}
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 cursor-pointer"
                />
              </div>
            </div>

            {/* Row 3: Dimensions calculations */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 rounded-xl bg-stone-50/50 border border-stone-150 dark:bg-zinc-950/30 dark:border-zinc-850">
              
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Logs Count *</label>
                <input
                  type="text"
                  required
                  value={formData.logsCount}
                  onChange={(e) => setFormData({ ...formData, logsCount: e.target.value })}
                  placeholder="e.g. 140 or 120-140"
                  className="w-full px-3 py-2 border border-stone-200 bg-white rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Length *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.avgLength}
                    onChange={(e) => setFormData({ ...formData, avgLength: e.target.value })}
                    placeholder="e.g. 18 or 12-24"
                    className="w-2/3 px-3 py-2 border border-stone-200 bg-white rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 font-semibold"
                  />
                  <select
                    value={formData.lengthUnit}
                    onChange={(e) => setFormData({ ...formData, lengthUnit: e.target.value })}
                    className="w-1/3 px-2 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 cursor-pointer font-bold text-stone-850 dark:text-zinc-200"
                  >
                    <option value="ft">ft</option>
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Girth *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.avgDiameter}
                    onChange={(e) => setFormData({ ...formData, avgDiameter: e.target.value })}
                    placeholder="e.g. 34 or 25-45"
                    className="w-2/3 px-3 py-2 border border-stone-200 bg-white rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 font-semibold"
                  />
                  <select
                    value={formData.girthUnit}
                    onChange={(e) => setFormData({ ...formData, girthUnit: e.target.value })}
                    className="w-1/3 px-2 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 cursor-pointer font-bold text-stone-850 dark:text-zinc-200"
                  >
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>

              {/* Volume estimator with custom typing override */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Volume (CFT) *</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoCalculateCft}
                      onChange={(e) => setAutoCalculateCft(e.target.checked)}
                      className="rounded border-stone-300 text-amber-500 focus:ring-amber-500 h-3 w-3"
                    />
                    <span>Auto Calc</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  disabled={autoCalculateCft}
                  value={formData.cft}
                  onChange={(e) => setFormData({ ...formData, cft: e.target.value })}
                  placeholder="e.g. 940 or 900-950"
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none h-[34px] ${
                    autoCalculateCft 
                      ? 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 cursor-not-allowed' 
                      : 'border-stone-200 bg-white text-stone-900 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
                  }`}
                />
              </div>

              {/* Volume (CBM) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider font-bold">Volume (CBM) *</label>
                </div>
                <input
                  type="text"
                  required
                  disabled={autoCalculateCft}
                  value={formData.cbm}
                  onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}
                  placeholder="e.g. 26.6 or 25.5-27.2"
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none h-[34px] ${
                    autoCalculateCft 
                      ? 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 cursor-not-allowed' 
                      : 'border-stone-200 bg-white text-stone-900 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
                  }`}
                />
              </div>

            </div>

            {/* Pricing details */}
            <div className="p-4 rounded-xl bg-stone-50/50 border border-stone-150 dark:bg-zinc-950/20 dark:border-zinc-850">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Rate per CFT (₹) (Optional)</label>
              <input
                type="text"
                value={formData.ratePerCft}
                onChange={(e) => setFormData({ ...formData, ratePerCft: e.target.value })}
                placeholder="e.g. 3670 or 3500-3800"
                className="w-full px-3 py-2 border border-stone-200 bg-white rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-850 dark:text-zinc-150 font-semibold"
              />
            </div>



            {/* Description Area */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Logs Description Profile</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail logs coloring, texture features, loading conditions..."
                className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 resize-none"
              />
            </div>

          </div>
        </div>

        {/* Right: Media uploads & configurations (x: 4cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Settings panel */}
          <div className="p-6 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 dark:border-zinc-850">
              Classifications
            </h3>

            {/* Grade */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Grades Selection</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 cursor-pointer"
              >
                <option value="FEQ">FEQ (First Export Quality)</option>
                <option value="Grade A">Grade A Quality</option>
                <option value="Grade B">Grade B Quality</option>
              </select>
            </div>

            {/* Status Info */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 dark:bg-zinc-950/40 dark:border-zinc-850 rounded-xl space-y-1">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest">Availability Status</label>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
                🔒 Availability status (Available, Reserved, Sold) will become editable after this container is published live.
              </p>
            </div>


          </div>

          {/* Media previews */}
          <div className="p-6 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 dark:border-zinc-850">
              Media Previews Gallery
            </h3>

            {/* Drag drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              className={`h-24 rounded-xl border border-dashed flex flex-col items-center justify-center p-3 transition-colors relative cursor-pointer ${
                isDragging 
                  ? 'border-amber-500 bg-amber-500/5' 
                  : 'border-stone-250 bg-stone-50/50 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-900'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                onDrop={(e) => e.stopPropagation()}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="h-4.5 w-4.5 text-stone-400 mb-1.5" />
              <p className="text-[9px] font-bold uppercase tracking-wide text-stone-500 text-center">Drag local photos here or click to upload</p>
            </div>

            {/* Direct Image URL input */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest">Or Add Photo by Web URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste direct URL (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-grow px-3 py-1.5 border border-stone-250 bg-stone-50/50 rounded-xl text-[10px] focus:outline-none focus:border-amber-500 dark:border-zinc-855 dark:bg-zinc-950/45 text-stone-850 dark:text-zinc-150"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] uppercase rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-semibold text-amber-500">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-150 rounded-full overflow-hidden dark:bg-zinc-800">
                  <div className="h-full bg-amber-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Photo preview list */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-850">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Arrange Catalog Media</p>
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 relative group shadow-sm flex flex-col justify-between">
                      <img src={url} alt="Logs preview" className="h-full w-full object-cover" />
                      
                      {/* Controls Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        {index > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 text-white transition-colors cursor-pointer"
                            title="Set as cover image"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[8px] font-extrabold uppercase bg-amber-500 text-zinc-950 px-2 py-0.5 rounded shadow">Cover</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removePreviewImage(index)}
                          className="p-1.5 rounded-lg bg-red-650 hover:bg-red-500 text-white transition-colors cursor-pointer"
                          title="Delete photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(true)}
              className="w-1/2 py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-850 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4 text-amber-500" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(false)}
              className="w-1/2 py-3 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 text-xs font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <span>Publish Logs</span>
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
