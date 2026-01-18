"use client";

import React, { useState } from 'react';
import { UploadSection } from '@/components/UploadSection';
import { Dashboard } from '@/components/Dashboard';
import { MessageSquare, LayoutDashboard, Github } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string>('Overall');
  const [loading, setLoading] = useState(false);

  const handleDataLoaded = (analyticsData: any) => {
    setData(analyticsData);
    setSelectedUser('Overall');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Chatlytics
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#" className="flex items-center gap-2 text-indigo-400">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>
            </nav>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {!data ? (
          <div className="h-[calc(100vh-160px)] flex items-center justify-center">
            <UploadSection onDataLoaded={handleDataLoaded} loading={loading} setLoading={setLoading} />
          </div>
        ) : (
          <div>
            <Dashboard
              data={data.analytics[selectedUser]}
              user={selectedUser}
              users={data.users}
              onSelectUser={setSelectedUser}
              onReset={() => setData(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
