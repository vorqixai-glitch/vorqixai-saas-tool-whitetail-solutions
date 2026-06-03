import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { ShieldAlert, Plus, Globe, UploadCloud, FileCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const licenseSchema = z.object({
  state: z.string().min(2, { message: "State name must be at least 2 characters" }),
  stateCode: z.string().length(2, { message: "State code must be exactly 2 characters" }),
});

function LicenseDocsRow({ app }: { app: any; key?: React.Key }) {
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { data: docs, refetch } = trpc.licensing.getDocs.useQuery({ applicationId: app.id }, { enabled: expanded });
  const uploadMutation = trpc.licensing.uploadDoc.useMutation({ onSuccess: () => { refetch(); setUploading(false); } });
  const efileMutation = trpc.licensing.efile.useMutation({ onSuccess: () => window.location.reload() });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      uploadMutation.mutate({ 
        applicationId: app.id, 
        fileName: file.name, 
        fileData: base64 
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <tr onClick={() => setExpanded(!expanded)} className="hover:bg-slate-50 cursor-pointer transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <Globe className="text-slate-400 w-5 h-5"/>
            <div>
              <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                {app.state}
                {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{app.stateCode}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${app.status === 'submitted' ? 'bg-indigo-100 text-indigo-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
            {app.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          {format(new Date(parseInt(app.createdAt!) || app.createdAt!), 'MMM d, yyyy')}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={3} className="px-6 py-6 bg-slate-50 border-t border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Application Documents</h4>
                {docs?.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {docs?.map((doc: any) => (
                      <li key={doc.id} className="flex items-center gap-2 text-sm text-slate-700 bg-white px-3 py-2 border border-slate-200 rounded-md shadow-sm">
                        <FileCheck className="w-4 h-4 text-green-500" />
                        {doc.fileName}
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="mt-4 flex gap-3">
                   <label className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm transition-colors cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                     <UploadCloud className="w-4 h-4" />
                     {uploading ? 'Uploading...' : 'Upload Document'}
                     <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
                   </label>
                </div>
              </div>
              
              <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm text-center">
                 <h4 className="text-sm font-medium text-slate-900 mb-1">State Submissions</h4>
                 <p className="text-xs text-slate-500 mb-4 max-w-[200px]">Ensure all official documents are uploaded before e-filing.</p>
                 <button 
                   onClick={() => efileMutation.mutate({ applicationId: app.id })}
                   disabled={docs?.length === 0 || app.status === 'submitted' || efileMutation.isPending}
                   className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
                 >
                   {app.status === 'submitted' ? 'Already E-Filed' : efileMutation.isPending ? 'E-Filing...' : 'E-File to State'}
                 </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Licensing() {
  const { data: apps, isLoading, refetch } = trpc.licensing.list.useQuery();
  const createMutation = trpc.licensing.create.useMutation({
    onSuccess: () => refetch()
  });

  const [isAdding, setIsAdding] = useState(false);
  const [stateName, setStateName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      licenseSchema.parse({ state: stateName, stateCode });
      createMutation.mutate({ state: stateName, stateCode });
      setIsAdding(false);
      setStateName('');
      setStateCode('');
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">State Licensing</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {isAdding && (
         <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-xl">
           <h2 className="text-lg font-medium text-slate-900 mb-4">Start New License Application</h2>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="flex gap-4">
               <div className="flex-1">
                 <label className="block text-sm font-medium text-slate-700">State Name (e.g. Pennsylvania)</label>
                 <input value={stateName} onChange={e => setStateName(e.target.value)} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                 {validationErrors.state && <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>}
               </div>
               <div className="w-32">
                 <label className="block text-sm font-medium text-slate-700">State Code</label>
                 <input value={stateCode} onChange={e => setStateCode(e.target.value)} type="text" maxLength={2} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm uppercase" />
                 {validationErrors.stateCode && <p className="mt-1 text-sm text-red-600">{validationErrors.stateCode}</p>}
               </div>
             </div>
             <div className="flex gap-4">
               <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">Start Application</button>
               <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium">Cancel</button>
             </div>
           </form>
         </div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {apps?.map((app) => (
              <LicenseDocsRow app={app} key={app.id} />
            ))}
            {apps?.length === 0 && !isAdding && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">No active applications. Start one to get compliant.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
