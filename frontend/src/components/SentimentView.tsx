"use client";

import React from 'react';
import {
    ArrowLeft, TrendingUp,
    BarChart2, Heart, Sparkles, AlertTriangle
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface SentimentViewProps {
    data: any;
    user: string;
    onBack: () => void;
}

export function SentimentView({ data, user, onBack }: SentimentViewProps) {
    if (!data) return null;

    if (!data.sentiment_analysis) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sentiment Data Missing</h3>
                <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
                    We couldn't find sentiment analysis for this session. Please re-upload your chat file to generate these advanced insights.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const sentiment = data.sentiment_analysis;
    const positive = sentiment.positive_percentage;
    const negative = sentiment.negative_percentage;
    const total = sentiment.total_messages;

    const pieData = [
        { name: 'Positive', value: positive, color: '#10b981' },
        { name: 'Negative', value: negative, color: '#ef4444' },
    ];

    // Peer comparison data if available
    const userBreakdown = data.user_sentiment_breakdown || {};
    const comparisonData = Object.entries(userBreakdown)
        .map(([name, stats]: any) => ({
            name,
            positive: stats.positive_percentage,
            negative: stats.negative_percentage,
            count: stats.message_count
        }))
        .filter(u => u.name !== 'group_notification')
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const negativityComparisonData = Object.entries(userBreakdown)
        .map(([name, stats]: any) => ({
            name,
            positive: stats.positive_percentage,
            negative: stats.negative_percentage,
            count: stats.message_count
        }))
        .filter(u => u.name !== 'group_notification')
        .sort((a, b) => b.negative - a.negative)
        .slice(0, 10);

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#09090b] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">Advanced Analysis</h2>
                        <p className="text-sm text-zinc-500 mt-1">Detailed emotional insights for <span className="text-indigo-400 font-medium">{user}</span></p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Live Model Analysis</span>
                </div>
            </div>


            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {/* Sentiment Distribution Pie */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 md:p-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-20 h-20 md:w-24 md:h-24 text-white rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-indigo-400" />
                                {user === 'Overall' ? 'Overall Sentiment' : 'User Sentiment Breakdown'}
                            </h3>
                            <p className="text-sm text-zinc-500 mt-1">Ratio of positive vs negative interactions</p>
                        </div>
                        <div className="flex-1 min-h-[350px] flex items-center justify-center relative pb-24 lg:pb-12">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                                        </linearGradient>
                                        <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={90}
                                        outerRadius={130}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.name === 'Positive' ? 'url(#colorPositive)' : 'url(#colorNegative)'}
                                            />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #3f3f46', color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-x-0 bottom-4 flex flex-wrap justify-center gap-3 md:gap-8 py-3 md:py-4 border-t border-white/5 bg-black/20 rounded-2xl mx-4">
                                {pieData.map(item => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: item.name === 'Positive' ? 'linear-gradient(to bottom, #34d399, #059669)' : 'linear-gradient(to bottom, #f87171, #dc2626)' }} />
                                        <span className="text-sm font-medium text-zinc-400">{item.name}</span>
                                        <span className="text-sm font-bold text-white">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Comparison Chart - Only for Overall view */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 md:p-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Heart className="w-20 h-20 md:w-24 md:h-24 text-white rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                {user === 'Overall' ? 'Top Users Positivity' : 'Positivity Context'}
                            </h3>
                            <p className="text-sm text-zinc-500 mt-1">
                                {user === 'Overall' ? 'Who is the most positive contributor?' : 'How your positivity compares to others'}
                            </p>
                        </div>
                        <div className="flex-1 min-h-[350px]">
                            {user === 'Overall' && comparisonData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #3f3f46', color: '#fff' }}
                                        />
                                        <Bar dataKey="positive" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} name="Positivity %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                                        <Heart className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h4 className="text-white font-bold mb-1">Personal Insights</h4>
                                    <p className="text-xs text-zinc-500">
                                        {positive > 60
                                            ? "Your tone is exceptionally positive! You're a mood booster in this chat."
                                            : positive > 40
                                                ? "Your tone is well-balanced and neutral. Great communication!"
                                                : "You tend to be more critical or serious in this conversation."}
                                    </p>
                                </div>
                            )}
                        </div>
                        {user === 'Overall' && (
                            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    <span className="text-emerald-400 font-semibold">Insight:</span> Peer comparison helps you understand the emotional dynamic between different members of the group.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Negativity Comparison - Full Width/Grid */}
            {user === 'Overall' && (
                <div className="grid grid-cols-1 gap-6 md:gap-10 mt-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 md:p-8 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <AlertTriangle className="w-20 h-20 md:w-24 md:h-24 text-white rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-red-400 transform rotate-180" />
                                    Top Users Negativity
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">Who tends to be more critical?</p>
                            </div>
                            <div className="flex-1 min-h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={negativityComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="barGradientNegative" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #3f3f46', color: '#fff' }}
                                        />
                                        <Bar dataKey="negative" fill="url(#barGradientNegative)" radius={[6, 6, 0, 0]} barSize={40} name="Negativity %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    <span className="text-red-400 font-semibold">Observation:</span> Understanding critical feedback patterns can help improve group harmony.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Footer */}
            <div className="flex justify-center pt-6">
                <button
                    onClick={onBack}
                    className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 hover:border-indigo-500/30"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                    <div className="relative flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold text-white tracking-wide">Return to Dashboard</span>
                    </div>
                </button>
            </div>
        </div>
    );
}

