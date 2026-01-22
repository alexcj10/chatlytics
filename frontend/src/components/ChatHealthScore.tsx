"use client";

import React from 'react';
import { Activity, Zap, Users, BarChart3, Info, Sparkles, Clock, AlertTriangle } from 'lucide-react';

interface ChatHealthScoreProps {
    health: any;
}

export function ChatHealthScore({ health }: ChatHealthScoreProps) {
    if (!health) return null;

    const { score, rating, color, metrics, description } = health;

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group h-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/[0.04] transition-all duration-500">
            {/* Premium Gradient Stripe */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20" />

            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-24 h-24 text-white" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Chat Health
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Algorithmic vitality assessment</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`text-2xl font-black ${color}`}>{score}%</span>
                        <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">{rating}</span>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    {/* Main Progress Bar */}
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]`}
                            style={{ width: `${score}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <MetricItem
                            label="Sentiment"
                            value={metrics.sentiment}
                            icon={<Sparkles className="w-3.5 h-3.5" />}
                            color="text-emerald-400"
                        />
                        <MetricItem
                            label="Engagement"
                            value={metrics.engagement}
                            icon={<Zap className="w-3.5 h-3.5" />}
                            color="text-indigo-400"
                        />
                        <MetricItem
                            label="Response"
                            value={metrics.response}
                            icon={<Clock className="w-3.5 h-3.5" />}
                            color="text-amber-400"
                        />
                        <MetricItem
                            label="Balance"
                            value={metrics.balance}
                            icon={<Users className="w-3.5 h-3.5" />}
                            color="text-rose-400"
                        />
                    </div>
                </div>

                {metrics.penalty > 0 && (
                    <div className="mt-4 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            Anomaly Penalty
                        </span>
                        <span className="text-xs font-black text-rose-400">-{metrics.penalty}%</span>
                    </div>
                )}

                <div className="mt-8 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function MetricItem({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
            </div>
            <div className="flex items-end justify-between">
                <span className={`text-lg font-black text-white`}>{Math.round(value)}%</span>
                <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-current ${color}`}
                        style={{ width: `${value}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
