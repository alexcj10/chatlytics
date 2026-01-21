"use client";

import React, { useState, useRef, useEffect } from 'react';
import { StatsCards } from '@/components/StatsCards';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { RefreshCcw, Info, TrendingUp, Calendar, Clock, MessageSquare, BarChart3, PieChart as PieChartIcon, ChevronDown, Users, History, Activity, Sparkles } from 'lucide-react';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { SentimentView } from '@/components/SentimentView';

interface DashboardProps {
    data: any;
    user: string;
    users: string[];
    onSelectUser: (user: string) => void;
    onReset: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

export function Dashboard({ data, user, users, onSelectUser, onReset }: DashboardProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showSentiment, setShowSentiment] = useState(false);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const isClickInsideDesktop = desktopDropdownRef.current && desktopDropdownRef.current.contains(event.target as Node);
            const isClickInsideMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(event.target as Node);

            if (!isClickInsideDesktop && !isClickInsideMobile) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);



    if (!data) return null;

    if (showSentiment) {
        return <SentimentView data={data} user={user} onBack={() => setShowSentiment(false)} />;
    }

    return (
        <div className="space-y-4 md:space-y-8 animate-in fade-in duration-1000 p-0 md:p-4 bg-[#09090b]">
            {/* Header Info */}
            <div className="flex flex-col gap-4 pb-2 border-b border-white/5">
                {/* Title Row */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
                            <TrendingUp className="w-4 h-4" />
                            Active Analytics Sessions
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate max-w-[280px] sm:max-w-none">
                            {user === 'Overall' ? "Overall Conversation" : user}
                        </h1>
                    </div>
                    {/* Desktop Controls */}
                    <div className="hidden lg:flex items-center gap-2 export-exclude">
                        <div className="relative" ref={desktopDropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 pl-4 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                            >
                                <Users className="w-4 h-4 text-zinc-500" />
                                <span className="max-w-[200px] truncate">{user}</span>
                                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[280px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar overscroll-contain p-1">
                                        {users.map((u) => (
                                            <button
                                                key={u}
                                                onClick={() => {
                                                    onSelectUser(u);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${user === u
                                                    ? 'bg-indigo-500/10 text-indigo-400'
                                                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                                                    }`}
                                            >
                                                <span className="truncate block">{u}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSentiment(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group"
                        >
                            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            <span>Advanced Analytics</span>
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                            aria-label="Upload New"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            <span>Upload New</span>
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Controls Row */}
                <div className="flex lg:hidden items-center gap-2 export-exclude">
                    <div className="relative flex-1" ref={mobileDropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-zinc-500" />
                                <span className="truncate max-w-[150px]">{user}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar overscroll-contain p-1">
                                    {users.map((u) => (
                                        <button
                                            key={u}
                                            onClick={() => {
                                                onSelectUser(u);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${user === u
                                                ? 'bg-indigo-500/10 text-indigo-400'
                                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                                                }`}
                                        >
                                            <span className="truncate block">{u}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowSentiment(true)}
                        className="flex items-center justify-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm transition-all"
                        aria-label="Advanced Analytics"
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                        aria-label="Upload New"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <StatsCards stats={data.basic_stats} links={data.links_shared} />

            {/* Sentiment Quick Overview */}
            {data.sentiment_analysis && (
                <div
                    onClick={() => setShowSentiment(true)}
                    className="grid grid-cols-1 gap-4 cursor-pointer group"
                >
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0 hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex shrink-0 items-center justify-center">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Sentiment Insight</h3>
                                <p className="text-xs text-zinc-500">The conversation tone is mostly <span className="text-indigo-400 font-semibold">{data.sentiment_analysis.positive_percentage > 50 ? 'Positive' : 'Critical'}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-evenly md:justify-end pr-0 md:pr-4">
                            <div className="text-center">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Positive</p>
                                <p className="text-lg font-black text-emerald-400">{data.sentiment_analysis.positive_percentage}%</p>
                            </div>
                            <div className="h-8 w-[1px] bg-white/10" />
                            <div className="text-center">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Negative</p>
                                <p className="text-lg font-black text-red-400">{data.sentiment_analysis.negative_percentage}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            {/* Timeline Chart - Full Width */}
            <ChartContainer title="Message Activity Timeline" subtitle="Daily distribution of messages over time" icon={<Calendar className="text-indigo-500" />}>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.daily_timeline}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
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
                            <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                            <Area type="monotone" dataKey="message_count" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </ChartContainer>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

                {/* Hourly Distribution */}
                <ChartContainer title="Hourly Distribution" subtitle="When are people most active during the day?" icon={<Clock className="text-purple-500" />}>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.hourly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="hour" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(h) => `${h}:00`} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
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
                                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                <Bar dataKey="message_count" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>


            </div>

            {/* Advanced Analytics Section */}
            <AdvancedAnalytics data={data} user={user} />

            {/* More Activity Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Monthly Activity */}
                <ChartContainer title="Monthly Trends" subtitle="Seasonality of your conversations" icon={<BarChart3 className="text-blue-500" />}>
                    <div className="h-full min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.monthly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="month" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="message_count" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Quarterly Activity */}
                <ChartContainer title="Quarterly Growth" subtitle="Long-term engagement overview" icon={<PieChartIcon className="text-emerald-500" />}>
                    <div className="h-full min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.quarterly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="quarter" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                <Bar dataKey="message_count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Yearly Activity */}
                <ChartContainer title="Yearly Overview" subtitle="High-level conversation volume by year" icon={<History className="text-orange-500" />}>
                    <div className="h-full min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.yearly_activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis dataKey="year" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="message_count" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                {/* Common Words - Simple Table */}
                <ChartContainer title="Information Insights" subtitle="Most frequent phrases and emojis" icon={<MessageSquare className="text-amber-500" />}>
                    <div className="space-y-6">
                        {/* Top Common Words */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Common Words</h4>
                            <div className="space-y-2 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
                                {data.most_common_words && Object.entries(data.most_common_words).map(([word, count]: any, i) => (
                                    <div key={word} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 group hover:border-white/20 transition-colors">
                                        <span className="text-sm text-zinc-300 font-medium">{word}</span>
                                        <span className="text-xs text-zinc-500 group-hover:text-indigo-400 font-mono transition-colors">{count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Top Emojis - Horizontal scrollable on mobile */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Emojis</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.emoji_analysis && Object.entries(data.emoji_analysis).map(([emoji, count]: any) => (
                                    <div key={emoji} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                        <span className="text-xl">{emoji}</span>
                                        <span className="text-xs text-zinc-500 font-mono">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ChartContainer>
            </div>

            {user === 'Overall' && (
                <div className="p-1 border border-white/10 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                    <ChartContainer title="Performance Comparison" subtitle="Who is contributing the most to the conversation?" icon={<TrendingUp className="text-sky-500" />}>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={Object.entries(data.most_active_users).map(([u, c]) => ({ name: u, count: c }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
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
        <section className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm flex flex-col h-full relative overflow-hidden isolate">
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
                <button className="text-zinc-600 hover:text-zinc-400 transition-colors -webkit-tap-highlight-color-transparent">
                    <Info className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 min-h-0 relative">
                {children}
            </div>
        </section>
    );
}
