"use client";

import React from 'react';
import { MessageSquare, Type, Image, Link as LinkIcon } from 'lucide-react';

interface StatsCardsProps {
    stats: {
        'Total Number of Messages': number;
        'Total Number of Words': number;
        'Total Number of Media Messages': number;
    };
    links: number;
}

export function StatsCards({ stats, links }: StatsCardsProps) {
    const cards = [
        {
            label: 'Total Messages',
            value: stats['Total Number of Messages'].toLocaleString(),
            icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
            gradient: 'from-indigo-500/10 to-indigo-500/5',
            borderColor: 'border-indigo-500/30',
            bgColor: 'bg-indigo-950/20'
        },
        {
            label: 'Total Words',
            value: stats['Total Number of Words'].toLocaleString(),
            icon: <Type className="w-5 h-5 text-purple-400" />,
            gradient: 'from-purple-500/10 to-purple-500/5',
            borderColor: 'border-purple-500/30',
            bgColor: 'bg-purple-950/20'
        },
        {
            label: 'Media Shared',
            value: stats['Total Number of Media Messages'].toLocaleString(),
            icon: <Image className="w-5 h-5 text-pink-400" />,
            gradient: 'from-pink-500/10 to-pink-400/5',
            borderColor: 'border-pink-500/30',
            bgColor: 'bg-pink-950/20'
        },
        {
            label: 'Links Shared',
            value: links.toLocaleString(),
            icon: <LinkIcon className="w-5 h-5 text-sky-400" />,
            gradient: 'from-sky-500/10 to-sky-400/5',
            borderColor: 'border-sky-500/30',
            bgColor: 'bg-sky-950/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={`relative group overflow-hidden rounded-xl md:rounded-[1.5rem] border ${card.borderColor} ${card.bgColor} p-4 md:p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-900/80`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner flex-shrink-0">
                            {card.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5 truncate">{card.label}</p>
                            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight truncate">{card.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
