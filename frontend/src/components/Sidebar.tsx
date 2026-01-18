"use client";

import React from 'react';
import { Users, User, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    users: string[];
    selectedUser: string;
    onSelect: (user: string) => void;
}

export function Sidebar({ users, selectedUser, onSelect }: SidebarProps) {
    return (
        <aside className="space-y-6 animate-in slide-in-from-left duration-700">
            <div>
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Select User
                </h2>

                <div className="space-y-1">
                    {users.map((user) => (
                        <button
                            key={user}
                            onClick={() => onSelect(user)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                selectedUser === user
                                    ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors shadow-sm",
                                    selectedUser === user ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700"
                                )}>
                                    {user === 'Overall' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                                <span className="truncate">{user}</span>
                            </div>
                            {selectedUser === user && (
                                <ArrowRight className="w-4 h-4 text-indigo-500" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Switching users updates charts instantly across all dimensions. Analytics are computed server-side for maximum precision.
                </p>
            </div>
        </aside>
    );
}
