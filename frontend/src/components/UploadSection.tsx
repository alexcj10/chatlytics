"use client";

import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { analyzeChat } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UploadSectionProps {
    onDataLoaded: (data: any) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export function UploadSection({ onDataLoaded, loading, setLoading }: UploadSectionProps) {
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.txt')) {
            setError('Please upload a .txt file exported from WhatsApp.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const result = await analyzeChat(file);
            onDataLoaded(result);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze the chat. Please make sure the file format is correct.');
            setLoading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const onDragLeave = () => {
        setDragActive(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                    Analyze Your Conversations
                </h1>
                <p className="text-zinc-400 text-sm md:text-lg max-w-md mx-auto">
                    Upload your exported WhatsApp chat file and get deep insights into your social dynamics.
                </p>
            </div>

            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    "relative group border-2 border-dashed rounded-2xl md:rounded-[2rem] p-6 md:p-12 transition-all duration-300",
                    dragActive
                        ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)]"
                        : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10",
                    loading && "pointer-events-none opacity-60"
                )}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                    onChange={onFileChange}
                    disabled={loading}
                    accept=".txt"
                />

                <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
                    <div className={cn(
                        "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                        dragActive && "scale-110 border-indigo-500/50"
                    )}>
                        {loading ? (
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        ) : (
                            <Upload className={cn(
                                "w-8 h-8 text-zinc-500 transition-colors",
                                dragActive ? "text-indigo-500" : "group-hover:text-zinc-300"
                            )} />
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-base md:text-xl font-medium text-zinc-200 mb-1">
                            {loading ? 'Processing chat...' : (dragActive ? 'Drop it here' : 'Drop your chat file here')}
                        </p>
                        {!loading && <p className="text-zinc-500 text-sm">or click to browse files</p>}
                    </div>

                    <div className="flex items-center justify-center gap-2 md:gap-4 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-zinc-950 border border-zinc-800/50 text-xs md:text-sm text-zinc-400 text-center">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-3 h-3 md:w-4 md:h-4" />
                            <span>.txt files only</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span>End-to-end local analysis</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in zoom-in-95">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="mt-8 md:mt-12 grid grid-cols-3 gap-3 md:gap-6 text-center">
                {[
                    { label: 'Activity Charts', desc: 'Hourly to yearly' },
                    { label: 'Word Analysis', desc: 'Common terms' },
                    { label: 'User Roles', desc: 'Who starts charts' }
                ].map((item, i) => (
                    <div key={i} className="p-2 md:p-4 rounded-xl md:rounded-2xl border border-white/10 bg-white/5">
                        <p className="text-zinc-200 font-medium mb-0.5 md:mb-1 text-xs md:text-sm">{item.label}</p>
                        <p className="text-zinc-500 text-[10px] md:text-xs">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
