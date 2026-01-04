'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setWaiting } from '../redux/features/battleSlice';
import { getQuizSocket } from '../redux/services/quizSocket';

export default function BattleLobby() {
  const [qCount, setQCount] = useState(5);
  const { status } = useSelector((state: RootState) => state.battle);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const startSearch = () => {
    if (!user) return;
    const socket = getQuizSocket();
    socket.emit('join_battle_queue', {
      userId: user.id,
      username: user.username,
      questionCount: qCount
    });
    dispatch(setWaiting());
  };

  return (
    <div className="glass-panel p-10 rounded-[3rem] max-w-md w-full text-center relative overflow-hidden">
      {status === 'idle' ? (
        <>
          <div className="w-20 h-20 rounded-2xl bg-arena-orange/10 flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">
            ⚔️
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tightest leading-none">1v1 MCQ <br /><span className="text-arena-orange italic">BATTLE</span></h2>
          <p className="opacity-60 font-bold mb-8 text-sm uppercase tracking-widest">Challenge another warrior in real-time. Speed and logic determine the victor.</p>

          <div className="mb-10 text-left">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 ml-2">Session Intensity</label>
            <select
              value={qCount}
              onChange={(e) => setQCount(parseInt(e.target.value))}
              className="w-full bg-foreground/5 border border-border-arena rounded-2xl p-4 font-black focus:ring-2 focus:ring-arena-orange/50 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value={5}>5 Questions (Skirmish)</option>
              <option value={10}>10 Questions (Duel)</option>
              <option value={20}>20 Questions (Warfare)</option>
            </select>
          </div>

          <button
            onClick={startSearch}
            className="w-full bg-arena-orange hover:bg-orange-600 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-orange-500/20 uppercase tracking-widest text-sm hover:scale-105 active:scale-95"
          >
            Enter Queue
          </button>
        </>
      ) : (
        <div className="py-12">
          <div className="relative w-24 h-24 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full border-4 border-arena-orange/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-4 border-arena-orange animate-spin border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
          </div>
          <h3 className="text-2xl font-black mb-2 animate-pulse">SCOUTING...</h3>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Finding a suitable comrade for combat</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-12 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Abort Mission
          </button>
        </div>
      )}
    </div>
  );
}
