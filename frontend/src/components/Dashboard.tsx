"use client";

import React from 'react';
import { StatsCards } from '@/components/StatsCards';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Download, RefreshCcw, Info, TrendingUp, Calendar, Clock, MessageSquare, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';

interface DashboardProps {
    data: any;
    user: string;
    onReset: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

export function Dashboard({ data, user, onReset }: DashboardProps) {
    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-900">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Active Analytics Sessions
                    </div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        {user === 'Overall' ? "Global Conversation Overview" : `${user}'s Performance`}
                        <span className="text-sm font-normal text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                            Live Data
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Upload New
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <StatsCards stats={data.basic_stats} links={data.links_shared} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Timeline Chart */}
                <ChartContainer title="Message Activity Timeline" subtitle="Daily distribution of messages over time" icon={<Calendar className="text-indigo-500" />}>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.daily_timeline}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis
                                    dataKey="only_date"
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '14px' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Area type="monotone" dataKey="message_count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Hourly Distribution */}
                <ChartContainer title="Hourly Distribution" subtitle="When are people most active during the day?" icon={<Clock className="text-purple-500" />}>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.hourly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="hour" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(h) => `${h}:00`} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '14px' }}
                                    cursor={{ fill: '#18181b' }}
                                />
                                <Bar dataKey="message_count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Weekly Activity */}
                <ChartContainer title="Weekly Activity" subtitle="Comparison of messages sent each day of the week" icon={<Calendar className="text-pink-500" />}>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weekly_activity} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="day" type="category" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '14px' }}
                                    cursor={{ fill: '#18181b' }}
                                />
                                <Bar dataKey="message_count" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Common Words - Simple Table */}
                <ChartContainer title="Information Insights" subtitle="Most frequent phrases and emojis" icon={<MessageSquare className="text-amber-500" />}>
                    <div className="grid grid-cols-2 gap-6 h-full">
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Common Words</h4>
                            <div className="space-y-2 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
                                {data.most_common_words && Object.entries(data.most_common_words).map(([word, count]: any, i) => (
                                    <div key={word} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
                                        <span className="text-sm text-zinc-300 font-medium">{word}</span>
                                        <span className="text-xs text-zinc-500 group-hover:text-indigo-400 font-mono transition-colors">{count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Emojis</h4>
                            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
                                {data.emoji_analysis && Object.entries(data.emoji_analysis).map(([emoji, count]: any) => (
                                    <div key={emoji} className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                                        <span className="text-2xl mb-1">{emoji}</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ChartContainer>
            </div>

            {/* Advanced Analytics Section */}
            <AdvancedAnalytics data={data} user={user} />

            {/* More Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Activity */}
                <ChartContainer title="Monthly Trends" subtitle="Seasonality of your conversations" icon={<BarChart3 className="text-blue-500" />}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.monthly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="month" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                />
                                <Area type="monotone" dataKey="message_count" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Quarterly Activity */}
                <ChartContainer title="Quarterly Growth" subtitle="Long-term engagement overview" icon={<PieChartIcon className="text-emerald-500" />}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.quarterly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="quarter" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                />
                                <Bar dataKey="message_count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Yearly Activity */}
                <ChartContainer title="Yearly Overview" subtitle="High-level conversation volume by year" icon={<TrendingUp className="text-orange-500" />}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.yearly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="year" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                />
                                <Line type="monotone" dataKey="message_count" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
            </div>

            {user === 'Overall' && (
                <div className="p-1 border border-zinc-800/50 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                    <ChartContainer title="Performance Comparison" subtitle="Who is contributing the most to the conversation?" icon={<TrendingUp className="text-sky-500" />}>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={Object.entries(data.most_active_users).map(([u, c]) => ({ name: u, count: c }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '14px' }}
                                        cursor={{ fill: '#18181b' }}
                                    />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                                        {Object.entries(data.most_active_users).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartContainer>
                </div>
            )}
        </div>
    );
}

function ChartContainer({ title, subtitle, icon, children }: { title: string, subtitle: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-8">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none mb-1.5">{title}</h3>
                        <p className="text-xs text-zinc-500 leading-tight max-w-[200px]">{subtitle}</p>
                    </div>
                </div>
                <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                    <Info className="w-4 h-4" />
                </button>
            </div>
            {children}
        </section>
    );
}
