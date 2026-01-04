'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getQuizSocket } from '../redux/services/quizSocket';

export default function BattleRoom() {
    const { questions, battleId, opponent, players, status, currentIdx } = useSelector((state: RootState) => state.battle);
    const { user } = useSelector((state: RootState) => state.auth);
    const [localAnswered, setLocalAnswered] = useState(false);

    const myProgress = Object.values(players).find(p => p.userId === user?.id);
    const opponentProgress = Object.values(players).find(p => p.userId !== user?.id);

    const submitAnswer = (answerIdx: number) => {
        if (localAnswered || status !== 'active') return;
        setLocalAnswered(true);
        const socket = getQuizSocket();
        socket.emit('submit_battle_answer', {
            battleId,
            questionIdx: currentIdx,
            answerIdx
        });
    };

    useEffect(() => {
        setLocalAnswered(false);
    }, [currentIdx]);

    if (status === 'finished') {
        const isWinner = (myProgress?.score || 0) > (opponentProgress?.score || 0);
        const isDraw = (myProgress?.score || 0) === (opponentProgress?.score || 0);

        return (
            <div className="glass-panel p-12 rounded-[3rem] max-w-2xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-arena-blue via-arena-purple to-arena-orange" />

                <h2 className="text-5xl font-black mb-8 tracking-tightest leading-none">COMBAT <br /><span className="text-arena-orange italic">CONCLUDED</span></h2>

                <div className="text-8xl mb-10 drop-shadow-2xl animate-bounce">
                    {isDraw ? '🤝' : isWinner ? '🏆' : '💀'}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="glass-panel p-6 rounded-3xl bg-arena-blue/5 border-arena-blue/20">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">You</p>
                        <div className="text-4xl font-black text-arena-blue">{myProgress?.score}</div>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl bg-red-500/5 border-red-500/20">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{opponent}</p>
                        <div className="text-4xl font-black text-red-500">{opponentProgress?.score}</div>
                    </div>
                </div>

                <p className="text-3xl font-black mb-10 uppercase tracking-tight">
                    {isDraw ? "Stalemate!" : isWinner ? "Glorious Victory!" : "Fallen in Battle!"}
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto bg-foreground text-background font-black px-12 py-5 rounded-[2rem] hover:scale-105 transition-all uppercase tracking-widest text-sm shadow-xl shadow-foreground/10"
                >
                    New Mission
                </button>
            </div>
        );
    }

    const question = questions[currentIdx];
    if (!question) return null;

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl px-4">
            {/* Arena Status Bar */}
            <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-arena-blue/10 flex items-center justify-center text-2xl glow-blue">👤</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Warrior (You)</p>
                        <p className="text-2xl font-black text-arena-blue">{myProgress?.score || 0}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mb-1">Sector</p>
                    <div className="bg-foreground/5 px-6 py-2 rounded-xl border border-border-arena">
                        <p className="text-xl font-black">{currentIdx + 1} <span className="opacity-30">/</span> {questions.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end text-right">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Opponent</p>
                        <p className="text-2xl font-black text-red-500">{opponentProgress?.score || 0}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-2xl glow-red shadow-[0_0_20px_rgba(239,68,68,0.2)]">⚔️</div>
                </div>
            </div>

            {/* Tactical Question Visualizer */}
            <div className="glass-panel p-10 md:p-14 rounded-[3.5rem] flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-arena-blue/5 blur-[100px] pointer-events-none" />

                <div className="text-xs font-black uppercase tracking-[0.4em] opacity-30 mb-8 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-foreground/20" />
                    Intelligence Briefing
                </div>

                <h3 className="text-2xl md:text-3xl font-black mb-12 leading-tight tracking-tightest">
                    {question.text}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {question.options.map((opt: string, idx: number) => (
                        <button
                            key={idx}
                            disabled={localAnswered}
                            onClick={() => submitAnswer(idx)}
                            className={`group relative p-6 text-left rounded-[1.5rem] border-2 transition-all duration-300 ${localAnswered
                                    ? 'opacity-40 border-transparent cursor-not-allowed'
                                    : 'glass-panel border-transparent hover:border-arena-blue/50 hover:bg-arena-blue/5 cursor-pointer hover:scale-[1.02]'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border transition-colors ${localAnswered ? 'bg-foreground/10 border-transparent text-foreground' : 'bg-arena-blue/10 border-arena-blue/20 text-arena-blue group-hover:bg-arena-blue group-hover:text-white'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1 font-bold text-lg">{opt}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Global Progress Matrix */}
            <div className="glass-panel p-4 rounded-[1.5rem] flex justify-center gap-3">
                {questions.map((_: any, i: number) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i < currentIdx
                                ? 'w-12 bg-arena-blue/40'
                                : i === currentIdx
                                    ? 'w-16 bg-arena-blue animate-pulse glow-blue'
                                    : 'w-4 bg-foreground/5'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
