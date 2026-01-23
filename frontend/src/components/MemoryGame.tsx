"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart, Star, Zap, MessageSquare, TrendingUp, Sparkles, Award, Coffee,
    X, ArrowLeft, CheckCircle, AlertCircle, Trophy, Clock
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
    { Icon: MessageSquare, color: 'text-emerald-400' },
    { Icon: TrendingUp, color: 'text-sky-400' },
    { Icon: Sparkles, color: 'text-violet-400' },
    { Icon: Award, color: 'text-orange-400' },
    { Icon: Coffee, color: 'text-teal-400' },
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

    const initializeGame = () => {
        // Create pairs of cards
        const cardPairs = CARD_ICONS.flatMap((_, index) => [
            { id: index * 2, iconIndex: index, isFlipped: false, isMatched: false },
            { id: index * 2 + 1, iconIndex: index, isFlipped: false, isMatched: false },
        ]);

        // Shuffle cards
        const shuffled = cardPairs.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setGameTime(0);
        setIsGameActive(true);
    };

    const handleCardClick = (cardId: number) => {
        if (!isGameActive) return;
        if (flippedCards.length === 2) return;
        if (flippedCards.includes(cardId)) return;

        const card = cards.find(c => c.id === cardId);
        if (card?.isMatched) return;

        const newFlippedCards = [...flippedCards, cardId];
        setFlippedCards(newFlippedCards);

        // Flip the card
        setCards(prev => prev.map(c =>
            c.id === cardId ? { ...c, isFlipped: true } : c
        ));

        // Check for match when 2 cards are flipped
        if (newFlippedCards.length === 2) {
            setMoves(prev => prev + 1);

            const [firstId, secondId] = newFlippedCards;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard && secondCard && firstCard.iconIndex === secondCard.iconIndex) {
                // Match found!
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
                // No match - flip back
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
        <div className="fixed inset-0 bg-zinc-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <button
                    onClick={handleExit}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-xl bg-teal-950/30 border border-teal-500/10">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-400" />
                            <span className="text-sm font-bold text-white">{formatTime(gameTime)}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-bold text-white">{moves} moves</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-white">{matches}/8</span>
                        </div>
                    </div>

                    {/* Processing indicator */}
                    {isProcessing && !processingComplete && !processingError && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-xs font-semibold text-indigo-400">Processing...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Game Grid */}
            <div className="w-full max-w-2xl mt-20 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">Memory Match</h2>
                <p className="text-sm text-zinc-500 text-center mb-8">Find all matching pairs!</p>

                <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {cards.map((card) => {
                        const { Icon, color } = CARD_ICONS[card.iconIndex];
                        const isFlipped = card.isFlipped || card.isMatched;

                        return (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card.id)}
                                disabled={!isGameActive || card.isMatched}
                                className={`
                                    aspect-square rounded-2xl border transition-all duration-300 cursor-pointer
                                    ${isFlipped
                                        ? card.isMatched
                                            ? 'bg-emerald-500/10 border-emerald-500/20 scale-95'
                                            : 'bg-indigo-500/10 border-indigo-500/20'
                                        : 'bg-teal-950/30 border-teal-500/10 hover:border-teal-500/30 hover:scale-105'
                                    }
                                    ${!isGameActive && !card.isMatched ? 'opacity-50' : ''}
                                `}
                                style={{
                                    transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(0deg)',
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    {isFlipped ? (
                                        <Icon className={`w-8 h-8 md:w-12 md:h-12 ${color}`} />
                                    ) : (
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-teal-500/20 border border-teal-500/30" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Mobile stats */}
                <div className="sm:hidden flex items-center justify-center gap-4 mt-6 px-4 py-3 rounded-xl bg-teal-950/30 border border-teal-500/10">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-400" />
                        <span className="text-sm font-bold text-white">{formatTime(gameTime)}</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-white">{moves}</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-white">{matches}/8</span>
                    </div>
                </div>

                {/* Reset button */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={initializeGame}
                        className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                    >
                        New Game
                    </button>
                </div>
            </div>

            {/* Notification Overlay */}
            {showNotification && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className={`
                        max-w-md w-full rounded-3xl p-8 border backdrop-blur-xl animate-in zoom-in-95 duration-300
                        ${processingComplete
                            ? 'bg-emerald-950/40 border-emerald-500/20'
                            : 'bg-red-950/40 border-red-500/20'
                        }
                    `}>
                        <div className="flex flex-col items-center text-center">
                            {processingComplete ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Chat Processed!</h3>
                                    <p className="text-sm text-zinc-400 mb-6">Your WhatsApp chat analysis is ready to view.</p>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={onViewDashboard}
                                            className="flex-1 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                                        >
                                            View Dashboard
                                        </button>
                                        <button
                                            onClick={() => setShowNotification(false)}
                                            className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
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
                                    <p className="text-sm text-zinc-400 mb-6">There was an error processing your chat. Please try again.</p>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={onExit}
                                            className="flex-1 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-sm font-bold text-red-400 hover:bg-red-500/30 transition-all cursor-pointer"
                                        >
                                            Back to Upload
                                        </button>
                                        <button
                                            onClick={() => setShowNotification(false)}
                                            className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                                        >
                                            Keep Playing
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
