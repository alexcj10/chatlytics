"use client";

import React from 'react';
import { Timer, UserPlus, Zap, Moon, Sun, Calendar } from 'lucide-react';

interface AdvancedAnalyticsProps {
    data: any;
    user: string;
}

export function AdvancedAnalytics({ data, user }: AdvancedAnalyticsProps) {
    if (!data) return null;

    const responseTimes = data.response_time_analysis || {};
    const initiators = data.conversation_initiator || {};
    const busyDay = data.most_busy_day || {};
    const busyMonth = data.most_busy_month || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {/* Response Time Analysis */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Timer className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none mb-1">Response Times</h3>
                        <p className="text-xs text-zinc-500">Average time to reply (mins)</p>
                    </div>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
                    {Object.entries(responseTimes).map(([name, time]: any) => (
                        <div key={name} className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">{name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{parseFloat(time).toFixed(1)}m</span>
                                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${Math.min(100, (time / 60) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Conversation Initiators */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none mb-1">Initiators</h3>
                        <p className="text-xs text-zinc-500">Who starts the chat most?</p>
                    </div>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
                    {Object.entries(initiators).map(([name, count]: any) => (
                        <div key={name} className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">{name}</span>
                            <span className="text-sm font-bold text-emerald-400">{count} chats</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Peak Activity */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none mb-1">Peak Records</h3>
                        <p className="text-xs text-zinc-500">Highest engagement periods</p>
                    </div>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Busiest Day</span>
                            <Calendar className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">{Object.keys(busyDay)[0] || 'N/A'}</span>
                            <span className="text-sm font-bold text-amber-400">{Object.values(busyDay)[0] as any || 0} msgs</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Busiest Month</span>
                            <Zap className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">{Object.keys(busyMonth)[0] || 'N/A'}</span>
                            <span className="text-sm font-bold text-amber-400">{Object.values(busyMonth)[0] as any || 0} msgs</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Busiest Day Name</span>
                            <Sun className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">{data.most_busy_weekday || 'N/A'}</span>
                            <span className="text-sm font-bold text-amber-400">Peak Volume</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Busiest Hour</span>
                            <Zap className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">
                                {data.most_busy_hour !== undefined ? `${data.most_busy_hour}:00` : 'N/A'}
                            </span>
                            <span className="text-sm font-bold text-amber-400">Peak Hour</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Extremes */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                    <Sun className="absolute -right-4 -top-4 w-24 h-24 text-zinc-800/20 group-hover:text-indigo-500/10 transition-colors" />
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Longest Message</h4>
                    <p className="text-sm text-zinc-300 italic mb-4 line-clamp-3">"{data.longest_message?.message}"</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-medium text-white">Sent by {data.longest_message?.user}</span>
                        <span className="text-[10px] py-1 px-2 rounded-md bg-zinc-800 text-zinc-400">{data.longest_message?.char_length} chars</span>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                    <Moon className="absolute -right-4 -top-4 w-24 h-24 text-zinc-800/20 group-hover:text-purple-500/10 transition-colors" />
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Most Wordy Message</h4>
                    <p className="text-sm text-zinc-300 italic mb-4 line-clamp-3">"{data.most_wordy_message?.message}"</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-medium text-white">Sent by {data.most_wordy_message?.user}</span>
                        <span className="text-[10px] py-1 px-2 rounded-md bg-zinc-800 text-zinc-400">{data.most_wordy_message?.word_count} words</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
