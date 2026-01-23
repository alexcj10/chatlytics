import React from 'react';
import { User, Zap, MessageSquare, Shield, Radio, Headphones, Reply, Crown, Award, Medal, AlertCircle, Moon, Brain } from 'lucide-react';

interface RankData {
    user: string;
    value: string;
}

interface RoleDetail {
    top: RankData[];
    description: string;
    label: string;
}

interface CRAPanelProps {
    roles: Record<string, RoleDetail>;
}

const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
        case 'initiator': return <Zap className="w-5 h-5 text-amber-400" />;
        case 'broadcaster': return <Radio className="w-5 h-5 text-emerald-400" />;
        case 'driver': return <Shield className="w-5 h-5 text-pink-400" />;
        case 'listener': return <Headphones className="w-5 h-5 text-purple-400" />;
        case 'responder': return <Reply className="w-5 h-5 text-blue-400" />;
        case 'night owl': return <Moon className="w-5 h-5 text-orange-400" />;
        default: return <User className="w-5 h-5 text-zinc-400" />;
    }
};

const getRoleGradient = (role: string) => {
    switch (role.toLowerCase()) {
        case 'initiator': return 'from-amber-500/20 to-transparent border-amber-500/30';
        case 'broadcaster': return 'from-emerald-500/20 to-transparent border-emerald-500/30';
        case 'driver': return 'from-pink-500/20 to-transparent border-pink-500/30';
        case 'listener': return 'from-purple-500/20 to-transparent border-purple-500/30';
        case 'responder': return 'from-blue-500/20 to-transparent border-blue-500/30';
        case 'night owl': return 'from-orange-500/20 to-transparent border-orange-500/30';
        default: return 'from-zinc-500/20 to-transparent border-zinc-500/30';
    }
};

const RankIcon = ({ rank }: { rank: number }) => {
    switch (rank) {
        case 0: return <Crown className="w-3 h-3 text-amber-400" />;
        case 1: return <Award className="w-3 h-3 text-slate-300" />;
        case 2: return <Medal className="w-3 h-3 text-amber-700/70" />;
        default: return null;
    }
};

export const CRAPanel: React.FC<CRAPanelProps> = ({ roles }) => {
    // Debugging: If roles exists but no cards show, we want to know why
    if (!roles) return null;

    const roleKeys = Object.keys(roles);
    if (roleKeys.length === 0) return null;

    const roleOrder = ['Initiator', 'Responder', 'Driver', 'Broadcaster', 'Listener', 'Night Owl'];
    // Ensure we show roles even if they are not in our preferred order list
    const actualRoles = roleOrder.filter(r => roleKeys.includes(r));
    const extraRoles = roleKeys.filter(r => !roleOrder.includes(r));
    const finalDisplayRoles = [...actualRoles, ...extraRoles];

    return (
        <div className="mt-12 mb-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white leading-none mb-1.5">Conversation Roles</h3>
                    <p className="text-sm text-zinc-500 font-medium">Top performers identifying the chat dynamics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalDisplayRoles.map((roleName) => {
                    const data = roles[roleName];
                    if (!data || !data.top || !Array.isArray(data.top) || data.top.length === 0) return null;

                    const winner = data.top[0];
                    const runnersUp = data.top.slice(1);

                    return (
                        <div
                            key={roleName}
                            className={`relative group overflow-hidden bg-[#09090b] bg-gradient-to-br ${getRoleGradient(roleName)} border rounded-2xl p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:scale-[1.01]`}
                        >
                            <div className="flex flex-col mb-4">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">{roleName}</h4>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                                        {getRoleIcon(roleName)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <RankIcon rank={0} />
                                            <span className="text-base font-bold text-white truncate">{winner.user}</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{data.label}: <span className="text-zinc-300">{winner.value}</span></span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                {data.description}
                            </p>

                            {runnersUp.length > 0 && (
                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    {runnersUp.map((rank, idx) => (
                                        <div key={`${roleName}-${rank.user}-${idx}`} className="flex items-center justify-between text-[11px]">
                                            <div className="flex items-center gap-2.5 text-zinc-400 min-w-0">
                                                <div className="w-4 shrink-0 flex justify-center">
                                                    <RankIcon rank={idx + 1} />
                                                </div>
                                                <span className="truncate font-medium">{rank.user}</span>
                                            </div>
                                            <span className="text-zinc-500 font-mono shrink-0 ml-2">{rank.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Fallback if no cards rendered despite header showing */}
            {finalDisplayRoles.filter(r => roles[r]?.top?.length > 0).length === 0 && (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-8 h-8 text-zinc-600" />
                    <p className="text-zinc-500 text-sm">No roles could be identified for this selection.</p>
                </div>
            )}
        </div>
    );
};
