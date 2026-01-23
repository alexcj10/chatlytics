"use client";

import React, { useState } from 'react';
import { UploadSection } from '@/components/UploadSection';
import { Dashboard } from '@/components/Dashboard';
import { MessageSquare, LayoutDashboard, Github, Gamepad2 } from 'lucide-react';
import { MemoryGame } from '@/components/MemoryGame';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string>('Overall');
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingError, setProcessingError] = useState(false);

  const handleDataLoaded = (analyticsData: any) => {
    setData(analyticsData);
    setSelectedUser('Overall');
    setLoading(false);
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <img src="/chatlytics.png" alt="Chatlytics Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Chatlytics
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium text-zinc-400">
              <button
                onClick={() => data && setShowUpload(false)}
                className={`flex items-center gap-2 transition-colors ${!showUpload && data ? 'text-indigo-400' : 'hover:text-white'} cursor-pointer`}
                disabled={!data}
                aria-label="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setShowGame(true)}
                className="flex items-center gap-2 transition-colors hover:text-fuchsia-400 cursor-pointer group"
                aria-label="Play Game"
              >
                <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Play</span>
              </button>
            </nav>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <a href="https://github.com/alexcj10/chatlytics" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-3 md:px-6 py-6 md:py-8">
        {!data || showUpload ? (
          <div className="min-h-[calc(100dvh-140px)] w-full flex flex-col items-center justify-center py-8">
            <UploadSection
              onDataLoaded={handleDataLoaded}
              loading={loading}
              setLoading={setLoading}
              setShowGame={setShowGame}
              processingComplete={processingComplete}
              setProcessingComplete={setProcessingComplete}
              processingError={processingError}
              setProcessingError={setProcessingError}
            />
          </div>
        ) : (
          <div>
            <Dashboard
              data={data.analytics[selectedUser]}
              user={selectedUser}
              users={data.users}
              onSelectUser={setSelectedUser}
              onReset={() => setShowUpload(true)}
            />
          </div>
        )}
      </main>

      {/* Memory Game Overlay */}
      {showGame && (
        <MemoryGame
          isProcessing={loading}
          processingComplete={processingComplete}
          processingError={processingError}
          onExit={() => {
            setShowGame(false);
            if (processingError) {
              setProcessingError(false);
            }
          }}
          onViewDashboard={() => {
            setShowGame(false);
          }}
        />
      )}
    </div>
  );
}
