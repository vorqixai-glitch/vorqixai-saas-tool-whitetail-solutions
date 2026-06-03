import React from 'react';
import { trpc } from '../utils/trpc';
import { useParams, Link } from 'react-router-dom';
import { Users, FileText, CheckSquare, ArrowLeft } from 'lucide-react';

export default function AdminClientDetails() {
  const { id } = useParams();
  const orgId = Number(id);
  const { data: stats, isLoading: statsLoading } = trpc.admin.getClientStats.useQuery({ orgId });
  const { data: data, isLoading: dataLoading } = trpc.admin.getClientData.useQuery({ orgId });
  const { data: clients } = trpc.admin.getClients.useQuery();
  
  const client = clients?.find(c => c.id === orgId);

  if (statsLoading || dataLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="p-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{client?.name}</h1>
          <p className="text-sm text-slate-400">Viewing Client Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Total Residents</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.residents || 0}</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Compliance Items</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.complianceItems || 0}</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-400">Documents</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.documents || 0}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-medium text-slate-200 mb-4">Residents</h2>
          {data?.residents.length === 0 ? (
            <p className="text-slate-400 text-sm">No residents found.</p>
          ) : (
            <ul className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
              {data?.residents.map(r => (
                <li key={r.id} className="py-2 text-sm text-slate-300">
                  {r.firstName} {r.lastName} - Room: {r.roomNumber || 'N/A'} ({r.status})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-medium text-slate-200 mb-4">Documents</h2>
          {data?.documents.length === 0 ? (
            <p className="text-slate-400 text-sm">No documents found.</p>
          ) : (
            <ul className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
              {data?.documents.map(d => (
                <li key={d.id} className="py-2 text-sm text-slate-300">
                  {d.title} <span className="text-slate-500 ml-2">({d.signed === 'yes' ? 'Signed' : 'Not signed'})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-medium text-slate-200 mb-4">Compliance Items</h2>
          {data?.complianceItems.length === 0 ? (
            <p className="text-slate-400 text-sm">No compliance items found.</p>
          ) : (
            <ul className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
              {data?.complianceItems.map(c => (
                <li key={c.id} className="py-2 text-sm text-slate-300">
                  {c.title} <span className="text-slate-500 ml-2">({c.status})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-medium text-slate-200 mb-4">License Applications</h2>
          {data?.licenseApplications.length === 0 ? (
            <p className="text-slate-400 text-sm">No applications found.</p>
          ) : (
            <ul className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
              {data?.licenseApplications.map(a => (
                <li key={a.id} className="py-2 text-sm text-slate-300">
                  {a.state} License - ({a.status})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-medium text-slate-200 mb-4">Actions</h2>
        <div className="flex gap-4">
          <Link to="/admin/messages" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition">
            Message Client
          </Link>
        </div>
      </div>
    </div>
  );
}
