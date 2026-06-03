import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { useAuthStore } from '../hooks/useAuthStore';
import { Send, User as UserIcon, Building } from 'lucide-react';
import { format } from 'date-fns';
import { safeDate } from '../utils/date';

export default function Messages() {
  const { user } = useAuthStore();
  // If we are admin, we need to pick a client. For now, let's just make a simple chat room that gets all messages if user, and for admin, we need a selector.
  // Actually, to make it work quickly, let's just use `otherUserId` for admin.
  // For admin, we should list clients to chat with, or simplify: if user is admin, they don't use this directly, they use it with an ID.
  // Wait, let's just make it a global support chat for the user to the admin, and admin sees a list of threads.
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [text, setText] = useState('');

  const { data: clients } = trpc.admin.getClients.useQuery(undefined, { enabled: user?.role === 'admin' });
  const { data: messages, refetch } = trpc.messages.list.useQuery({ 
    otherUserId: user?.role === 'admin' ? selectedUserId : undefined 
  }, { 
    enabled: user?.role !== 'admin' || !!selectedUserId 
  });

  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setText('');
      refetch();
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // if user is sending, receiver is admin. Hardcode admin ID as 1 for now (assuming first user is admin), OR find the admin.
    // Better: change schema to not require receiverId and just have orgId for support tickets.
    // Let's assume we reply to whoever. If user is sending, it goes to admin (say ID 1).
    // If admin is sending, it goes to selectedUserId.
    let receiver = -1;
    if (user?.role === 'admin' && selectedUserId) {
      receiver = selectedUserId;
    }
    
    sendMutation.mutate({ text, receiverId: receiver });
  };

  if (user?.role === 'admin' && !selectedUserId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Messages</h1>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <ul className="divide-y divide-slate-700">
            {clients?.map(client => (
              <li key={client.id} className="p-4 hover:bg-slate-700/50 cursor-pointer flex items-center justify-between" onClick={() => setSelectedUserId(client.localOwnerId!)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-slate-200">{client.name}</h3>
                    <p className="text-sm text-slate-400">Owner ID: {client.localOwnerId}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-lg">{user?.role === 'admin' ? `Chat with ${clients?.find(c => c.localOwnerId === selectedUserId)?.name || 'Client'}` : 'Support Chat'}</h1>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setSelectedUserId(undefined)} className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded">Back</button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900 flex flex-col-reverse">
        {messages?.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`flex max-w-[80%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                   <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'}`}>
                     {msg.text}
                   </div>
                   <div className={`text-xs text-slate-400 mt-1 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {format(safeDate(msg.createdAt), 'MMM d, yyyy h:mm a')}
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-900 border-transparent rounded-full focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm dark:text-white"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
            disabled={!text.trim() || sendMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
