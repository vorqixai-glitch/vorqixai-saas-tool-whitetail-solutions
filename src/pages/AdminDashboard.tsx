import React from 'react';
import { trpc } from '../utils/trpc';
import { Users, FileText, CheckSquare, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: clients, isLoading } = trpc.admin.getClients.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Clients</p>
              <h3 className="text-2xl font-bold text-white">{clients?.length || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-slate-200 mb-4">Recent Clients</h2>
        <div className="bg-slate-800 shadow-sm border border-slate-700 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Organization Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {clients?.map((client) => (
                <tr key={client.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-200">{client.name}</div>
                        <div className="text-xs text-slate-400">{client.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {format(new Date(parseInt(client.createdAt!) || client.createdAt!), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/clients/${client.id}`} className="text-indigo-400 hover:text-indigo-300">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
              {clients?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
