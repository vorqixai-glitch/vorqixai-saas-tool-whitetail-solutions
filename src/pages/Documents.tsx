import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { FileText, Plus, FileSignature } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  content: z.string().min(5, { message: "Content must be at least 5 characters" }),
});

export default function Documents() {
  const { data: documents, isLoading, refetch } = trpc.documents.list.useQuery();
  const createMutation = trpc.documents.create.useMutation({
    onSuccess: () => refetch()
  });

  const signMutation = trpc.documents.sign.useMutation({
    onSuccess: () => refetch()
  });
  
  const extractMutation = trpc.ai.extractLease.useMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [extractionResult, setExtractionResult] = useState<any>(null);

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      documentSchema.parse({ title, content });
      
      let newTitle = title;
      if (title.toLowerCase().includes('lease') || title.toLowerCase().includes('agreement')) {
         const extracted = await extractMutation.mutateAsync({ text: content });
         if (extracted && extracted.firstName) {
            setExtractionResult(extracted);
            newTitle = `${title} - Extracted: ${extracted.firstName} ${extracted.lastName}`;
         }
      }
      
      createMutation.mutate({ title: newTitle, content, category: 'other' });
      setIsAdding(false);
      setTitle('');
      setContent('');
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Documents</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Document
        </button>
      </div>

      {isAdding && (
         <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-xl">
           <h2 className="text-lg font-medium text-slate-900 mb-4">New Document</h2>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700">Document Title</label>
               <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
               {validationErrors.title && <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>}
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Content</label>
               <textarea rows={4} value={content} onChange={e => setContent(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
               {validationErrors.content && <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>}
             </div>
             <div className="flex gap-4">
               <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">Save Document</button>
               <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium">Cancel</button>
             </div>
           </form>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents?.map((doc) => (
          <div key={doc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.signed === 'yes' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                {doc.signed === 'yes' ? 'Signed' : 'Not Signed'}
              </span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 truncate mb-1">{doc.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">{doc.content}</p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">{format(new Date(parseInt(doc.createdAt!) || doc.createdAt!), 'MMM d, yyyy')}</span>
              {doc.signed !== 'yes' && (
                <button 
                  onClick={() => signMutation.mutate({ id: doc.id })}
                  disabled={signMutation.isPending}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  <FileSignature className="w-4 h-4" />
                  Sign
                </button>
              )}
            </div>
          </div>
        ))}

        {documents?.length === 0 && !isAdding && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
            No documents found. Click "Create Document" to add one.
          </div>
        )}
      </div>
    </div>
  );
}
