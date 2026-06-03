import React, { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { z } from 'zod';
import { CreditCard, Check } from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  beds: z.number().min(0, { message: "Beds cannot be negative" }),
  narLevel: z.string()
});

export default function Settings() {
  const { data: org, isLoading, refetch } = trpc.org.myOrg.useQuery();
  const updateMutation = trpc.org.createOrUpdate.useMutation({
    onSuccess: () => refetch()
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    beds: 0,
    narLevel: 'none'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.zip && formData.zip.length === 5) {
      // Auto-fill city and state from zip code
      fetch(`https://api.zippopotam.us/us/${formData.zip}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Invalid Zip');
        })
        .then(data => {
          if (data && data.places && data.places.length > 0) {
            const place = data.places[0];
            setFormData(prev => ({
              ...prev,
              city: prev.city || place['place name'],
              state: prev.state || place['state abbreviation']
            }));
          }
        })
        .catch(() => {});
    }
  }, [formData.zip]);

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        phone: org.phone || '',
        address: org.address || '',
        city: org.city || '',
        state: org.state || '',
        zip: org.zip || '',
        beds: org.beds || 0,
        narLevel: org.narLevel || 'none'
      });
    }
  }, [org]);

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      const dataToValidate = {
        ...formData,
        beds: Number(formData.beds)
      };
      settingsSchema.parse(dataToValidate);
      updateMutation.mutate(dataToValidate);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        ((err as any).errors || []).forEach((e: any) => {
          if (e.path && e.path[0]) {
            errors[e.path[0].toString()] = e.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-6">Profile Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Organization Name</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">NARR Level</label>
                  <select value={formData.narLevel} onChange={e => setFormData({...formData, narLevel: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="none">None</option>
                    <option value="level_1">Level 1</option>
                    <option value="level_2">Level 2</option>
                    <option value="level_3">Level 3</option>
                    <option value="level_4">Level 4</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Address</label>
                  <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">City</label>
                  <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">State</label>
                    <input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Zip</label>
                    <input value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Total Beds</label>
                  <input min={0} value={formData.beds} onChange={e => setFormData({...formData, beds: Number(e.target.value)})} type="number" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  {validationErrors.beds && <p className="mt-1 text-sm text-red-600">{validationErrors.beds}</p>}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200">
                <div className="flex justify-end">
                  <button type="submit" disabled={updateMutation.isPending} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
              {updateMutation.isSuccess && <p className="text-sm text-green-600 text-right mt-2">Saved successfully!</p>}
            </form>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Subscription & Billing
            </h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Business Plan</h3>
                  <p className="text-sm text-slate-500">Billed monthly</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900">$79</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {[
                  'Unlimited PDF upload and AI processing',
                  'Unlimited properties & tenants',
                  'Advanced Admin & Client Portal features',
                  'Premium chat support',
                  'Stripe billing active'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="pt-6 border-t border-slate-200">
                <button 
                  className="w-full py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition"
                  onClick={() => alert("Stripe Customer Portal will open here.")}
                >
                  Manage Billing
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
