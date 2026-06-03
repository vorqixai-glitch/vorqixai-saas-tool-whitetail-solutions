import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { HelpCircle, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const consultingSchema = z.object({
  topic: z.string().min(5, { message: "Topic must be at least 5 characters" }),
});

export default function Consulting() {
  const { data: bookings, isLoading, refetch } = trpc.consulting.list.useQuery();
  const createMutation = trpc.consulting.create.useMutation({
    onSuccess: () => refetch()
  });

  const [isAdding, setIsAdding] = useState(false);
  const [topic, setTopic] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      consultingSchema.parse({ topic });
      createMutation.mutate({ topic, description: 'Booked from UI' });
      setIsAdding(false);
      setTopic('');
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Expert Consulting</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Book Consultation
        </button>
      </div>

      {isAdding && (
         <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-xl mb-6">
           <h2 className="text-lg font-medium text-slate-900 mb-4">Book an Expert</h2>
           <form onSubmit={handleSubmit} className="flex items-end gap-4">
             <div className="flex-1">
               <label className="block text-sm font-medium text-slate-700">Topic</label>
               <input value={topic} onChange={e => setTopic(e.target.value)} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" placeholder="e.g. State Licensing Compliance" />
               {validationErrors.topic && <p className="mt-1 text-sm text-red-600">{validationErrors.topic}</p>}
             </div>
             <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">Book</button>
             <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium">Cancel</button>
           </form>
         </div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Topic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {bookings?.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {booking.topic}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {format(new Date(parseInt(booking.createdAt!) || booking.createdAt!), 'MMM d, yyyy')}
                </td>
              </tr>
            ))}
            {bookings?.length === 0 && !isAdding && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">No bookings yet. Need help? Book an expert.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
