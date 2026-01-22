"use client";

import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';

interface AnomalyPanelProps {
    anomalies: any[];
}

export function AnomalyPanel({ anomalies }: AnomalyPanelProps) {
    if (!anomalies || anomalies.length === 0) {
        return (
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-white font-bold mb-1">No Anomalies Detected</h3>
                <p className="text-sm text-zinc-500">Conversation patterns appear within normal statistical bounds.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        Anomaly Detection
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Statistical outliers and pattern shifts</p>
                </div>
                <span className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                    {anomalies.length} Events
                </span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {anomalies.map((anomaly, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${anomaly.severity === 'Critical'
                            ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                            : anomaly.type.includes('Joy')
                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {anomaly.type.includes('Burst') ? (
                                    <TrendingUp className="w-4 h-4 text-rose-400" />
                                ) : anomaly.type.includes('Joy') ? (
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-rose-400" />
                                )}
                                <span className={`text-xs font-black uppercase tracking-wider ${anomaly.type.includes('Joy') ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                    {anomaly.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-500">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-bold">{anomaly.date}</span>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                            {anomaly.description}
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-tighter">Impact</span>
                                <span className="text-xs font-bold text-white">{anomaly.severity}</span>
                            </div>
                            {anomaly.z_score && (
                                <div className="flex flex-col border-l border-white/10 pl-4">
                                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-tighter">Z-Score</span>
                                    <span className="text-xs font-bold text-white">+{anomaly.z_score}σ</span>
                                </div>
                            )}
                            {anomaly.metrics && (
                                <>
                                    <div className="flex flex-col border-l border-white/10 pl-4">
                                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-tighter">Volume</span>
                                        <span className="text-xs font-bold text-white">{anomaly.metrics.messages}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-white/10 pl-4">
                                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-tighter">Tone</span>
                                        <span className={`text-xs font-bold ${anomaly.metrics.sentiment > 0.2 ? 'text-emerald-400' : anomaly.metrics.sentiment < -0.2 ? 'text-rose-400' : 'text-zinc-400'}`}>
                                            {anomaly.metrics.sentiment > 0 ? '+' : ''}{anomaly.metrics.sentiment}
                                        </span>
                                    </div>
                                </>
                            )}
                            {anomaly.change && (
                                <div className="flex flex-col border-l border-white/10 pl-4">
                                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-tighter">Shift</span>
                                    <span className={`text-xs font-bold ${anomaly.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {anomaly.change > 0 ? '+' : ''}{anomaly.change}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
