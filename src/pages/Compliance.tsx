import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { CheckSquare, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const complianceSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
});

export default function Compliance() {
  const { data: items, isLoading, refetch } = trpc.compliance.list.useQuery();
  const createMutation = trpc.compliance.create.useMutation({
    onSuccess: () => refetch()
  });

  const updateStatusMutation = trpc.compliance.updateStatus.useMutation({
    onSuccess: () => refetch()
  });

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      complianceSchema.parse({ title });
      createMutation.mutate({ title, category: 'facility', priority: 'medium' });
      setIsAdding(false);
      setTitle('');
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compliance Tracking</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600"><Clock className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-semibold text-slate-900">{items?.filter(i => i.status === 'pending').length || 0}</div>
            <div className="text-sm font-medium text-slate-500">Pending</div>
          </div>
        </div>
      </div>

      {isAdding && (
         <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-xl mb-6">
           <h2 className="text-lg font-medium text-slate-900 mb-4">New Compliance Item</h2>
           <form onSubmit={handleSubmit} className="flex items-end gap-4">
             <div className="flex-1">
               <label className="block text-sm font-medium text-slate-700">Requirement Title</label>
               <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
               {validationErrors.title && <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>}
             </div>
             <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">Save</button>
             <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium">Cancel</button>
           </form>
         </div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {items?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{item.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {item.status !== 'completed' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'completed' })}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items?.length === 0 && !isAdding && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No compliance items.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
