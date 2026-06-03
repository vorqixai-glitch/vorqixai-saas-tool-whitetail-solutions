import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { Search, Plus, Filter, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { safeDate } from '../utils/date';
import { z } from 'zod';

const residentSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  status: z.string(),
  roomNumber: z.string().optional(),
});

export default function Residents() {
  const { data: residents, isLoading, refetch } = trpc.residents.list.useQuery();
  const createMutation = trpc.residents.create.useMutation({
    onSuccess: () => refetch()
  });

  const updateStatusMutation = trpc.residents.updateStatus.useMutation({
    onSuccess: () => refetch()
  });

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', status: 'active', roomNumber: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      residentSchema.parse(formData);
      createMutation.mutate(formData);
      setIsAdding(false);
      setFormData({ firstName: '', lastName: '', status: 'active', roomNumber: '' });
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Residents</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Resident
        </button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative rounded-md shadow-sm w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input type="text" className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border" placeholder="Search residents..." />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 border-b border-slate-200 bg-indigo-50/50 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
              <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} type="text" className="w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border" />
              {validationErrors.firstName && <p className="mt-1 text-xs text-red-600">{validationErrors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
              <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} type="text" className="w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border" />
              {validationErrors.lastName && <p className="mt-1 text-xs text-red-600">{validationErrors.lastName}</p>}
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-700 mb-1">Room</label>
              <input value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} type="text" className="w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border" />
            </div>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">Save</button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-md text-sm font-medium">Cancel</button>
          </form>
        )}

        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Intake Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Background</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {residents?.map((resident) => (
              <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                      {resident.firstName[0]}{resident.lastName[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{resident.firstName} {resident.lastName}</div>
                      <div className="text-sm text-slate-500">{resident.email || 'No email provided'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {resident.roomNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${resident.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                    {resident.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {resident.intakeDate ? format(safeDate(resident.intakeDate), 'MMM d, yyyy') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={resident.backgroundCheckStatus || 'pending'} 
                    onChange={e => updateStatusMutation.mutate({ id: resident.id, backgroundCheckStatus: e.target.value })}
                    disabled={updateStatusMutation.isPending}
                    className="block w-full text-xs font-medium bg-amber-100 text-amber-800 capitalize border-none focus:ring-0 rounded-full py-1 pl-3 pr-8"
                  >
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="not_required">Not Required</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {residents?.length === 0 && !isAdding && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No residents found. Click "Add Resident" to start building your roster.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
