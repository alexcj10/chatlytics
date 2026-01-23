"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart, Star, Zap, MessageSquare, TrendingUp, Sparkles, Award, Coffee,
    X, ArrowLeft, CheckCircle, AlertCircle, Trophy, Clock, PartyPopper
} from 'lucide-react';

interface MemoryGameProps {
    isProcessing: boolean;
    processingComplete: boolean;
    processingError: boolean;
    onExit: () => void;
    onViewDashboard: () => void;
}

const CARD_ICONS = [
    { Icon: Heart, color: 'text-rose-400' },
    { Icon: Star, color: 'text-amber-400' },
    { Icon: Zap, color: 'text-indigo-400' },
    { Icon: MessageSquare, color: 'text-teal-400' },
    { Icon: TrendingUp, color: 'text-emerald-400' },
    { Icon: Sparkles, color: 'text-violet-400' },
    { Icon: Award, color: 'text-orange-400' },
    { Icon: Coffee, color: 'text-cyan-400' },
];

interface Card {
    id: number;
    iconIndex: number;
    isFlipped: boolean;
    isMatched: boolean;
}

export function MemoryGame({
    isProcessing,
    processingComplete,
    processingError,
    onExit,
    onViewDashboard
}: MemoryGameProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [isGameActive, setIsGameActive] = useState(true);
    const [showNotification, setShowNotification] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, []);

    // Timer
    useEffect(() => {
        if (!isGameActive) return;
        const timer = setInterval(() => {
            setGameTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [isGameActive]);

    // Show notification when processing completes or errors
    useEffect(() => {
        if (processingComplete || processingError) {
            setShowNotification(true);
            setIsGameActive(false);
        }
    }, [processingComplete, processingError]);

    // Check for game completion
    useEffect(() => {
        if (matches === 8 && !gameCompleted) {
            setGameCompleted(true);
            setIsGameActive(false);
            setTimeout(() => setShowNotification(true), 500);
        }
    }, [matches, gameCompleted]);

    const initializeGame = () => {
        const cardPairs = CARD_ICONS.flatMap((_, index) => [
            { id: index * 2, iconIndex: index, isFlipped: false, isMatched: false },
            { id: index * 2 + 1, iconIndex: index, isFlipped: false, isMatched: false },
        ]);

        const shuffled = cardPairs.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setGameTime(0);
        setIsGameActive(true);
        setGameCompleted(false);
        setShowNotification(false);
    };

    const handleCardClick = (cardId: number) => {
        if (!isGameActive) return;
        if (flippedCards.length === 2) return;
        if (flippedCards.includes(cardId)) return;

        const card = cards.find(c => c.id === cardId);
        if (card?.isMatched) return;

        const newFlippedCards = [...flippedCards, cardId];
        setFlippedCards(newFlippedCards);

        setCards(prev => prev.map(c =>
            c.id === cardId ? { ...c, isFlipped: true } : c
        ));

        if (newFlippedCards.length === 2) {
            setMoves(prev => prev + 1);

            const [firstId, secondId] = newFlippedCards;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard && secondCard && firstCard.iconIndex === secondCard.iconIndex) {
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === firstId || c.id === secondId
                            ? { ...c, isMatched: true }
                            : c
                    ));
                    setMatches(prev => prev + 1);
                    setFlippedCards([]);
                }, 500);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === firstId || c.id === secondId
                            ? { ...c, isFlipped: false }
                            : c
                    ));
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExit = () => {
        if (processingComplete) {
            onViewDashboard();
        } else {
            onExit();
        }
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/95 backdrop-blur-xl z-50 flex items-center justify-center overflow-hidden animate-in fade-in duration-300">
            <div className="w-full max-w-3xl h-full flex flex-col">
                {/* Compact Header */}
                <div className="flex-shrink-0 px-4 md:px-6 py-3 flex items-center justify-between gap-4 border-b border-zinc-700/50">
                    <button
                        onClick={handleExit}
                        className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-3 px-2.5 md:px-4 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="text-xs font-bold text-white">{formatTime(gameTime)}</span>
                            </div>
                            <div className="w-px h-3 bg-zinc-700" />
                            <div className="flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs font-bold text-white">{moves}</span>
                            </div>
                            <div className="w-px h-3 bg-zinc-700" />
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs font-bold text-white">{matches}/8</span>
                            </div>
                        </div>

                        {isProcessing && !processingComplete && !processingError && (
                            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-xs font-semibold text-indigo-300 hidden md:inline">Processing...</span>
                                <span className="text-[10px] font-semibold text-indigo-300 md:hidden">Processing</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Compact Game Content */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-1">Memory Match</h2>
                        <p className="text-sm text-zinc-400">Find all matching pairs!</p>
                    </div>

                    {/* Compact Grid */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {cards.map((card) => {
                            const { Icon, color } = CARD_ICONS[card.iconIndex];
                            const isFlipped = card.isFlipped || card.isMatched;

                            return (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    disabled={!isGameActive || card.isMatched}
                                    className={`
                                        w-20 h-20 rounded-xl border transition-all duration-300 cursor-pointer
                                        ${isFlipped
                                            ? card.isMatched
                                                ? 'bg-emerald-500/10 border-emerald-500/30 scale-95'
                                                : 'bg-zinc-700/50 border-zinc-600'
                                            : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600 hover:scale-105'
                                        }
                                        ${!isGameActive && !card.isMatched ? 'opacity-50' : ''}
                                    `}
                                >
                                    <div className="w-full h-full flex items-center justify-center">
                                        {isFlipped ? (
                                            <Icon className={`w-10 h-10 ${color}`} />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-zinc-700/50 border border-zinc-600/50" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Compact Reset */}
                    <button
                        onClick={initializeGame}
                        className="px-5 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm font-bold text-zinc-300 hover:text-white hover:border-zinc-600 transition-all cursor-pointer"
                    >
                        New Game
                    </button>
                </div>
            </div>

            {/* Notification Overlay */}
            {
                showNotification && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                        <div className={`
                        max-w-md w-full mx-4 rounded-2xl p-6 border backdrop-blur-xl animate-in zoom-in-95 duration-300
                        ${gameCompleted
                                ? 'bg-zinc-800/90 border-zinc-700'
                                : processingComplete
                                    ? 'bg-emerald-950/40 border-emerald-500/20'
                                    : 'bg-red-950/40 border-red-500/20'
                            }
                    `}>
                            <div className="flex flex-col items-center text-center">
                                {gameCompleted ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-zinc-700/50 border border-zinc-600 flex items-center justify-center mb-4">
                                            <PartyPopper className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">You Won!</h3>
                                        <p className="text-sm text-zinc-400 mb-2">All pairs matched!</p>
                                        <div className="flex items-center gap-4 mb-6 text-zinc-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-bold">{formatTime(gameTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-4 h-4" />
                                                <span className="text-sm font-bold">{moves} moves</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={initializeGame}
                                                className="flex-1 px-6 py-2.5 rounded-lg bg-zinc-700/50 border border-zinc-600 text-sm font-bold text-white hover:bg-zinc-700 transition-all cursor-pointer"
                                            >
                                                Play Again
                                            </button>
                                            <button
                                                onClick={handleExit}
                                                className="px-6 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-sm font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                                            >
                                                Exit
                                            </button>
                                        </div>
                                    </>
                                ) : processingComplete ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Chat Processed!</h3>
                                        <p className="text-sm text-zinc-400 mb-6">Your analysis is ready to view.</p>
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={onViewDashboard}
                                                className="flex-1 px-6 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                                            >
                                                View Dashboard
                                            </button>
                                            <button
                                                onClick={() => setShowNotification(false)}
                                                className="px-6 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-sm font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                                            >
                                                Keep Playing
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                                            <AlertCircle className="w-8 h-8 text-red-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Processing Failed</h3>
                                        <p className="text-sm text-zinc-400 mb-6">Please try again.</p>
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={onExit}
                                                className="flex-1 px-6 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-sm font-bold text-red-400 hover:bg-red-500/30 transition-all cursor-pointer"
                                            >
                                                Back to Upload
                                            </button>
                                            <button
                                                onClick={() => setShowNotification(false)}
                                                className="px-6 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-sm font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                                            >
                                                Keep Playing
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
