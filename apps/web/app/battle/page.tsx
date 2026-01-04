'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { initQuizSocket } from '../../redux/services/quizSocket';
import { battleStart, battleUpdate, endBattle } from '../../redux/features/battleSlice';
import { useRouter } from 'next/navigation';
import BattleLobby from '../../components/BattleLobby';
import BattleRoom from '../../components/BattleRoom';

export default function BattlePage() {
  const { token, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const { status } = useSelector((state: RootState) => state.battle);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    const socket = initQuizSocket(token);

    socket.on('battle_start', (data) => {
      dispatch(battleStart(data));
    });

    socket.on('battle_update', (data) => {
      dispatch(battleUpdate(data));
    });

    socket.on('battle_end', (data) => {
      dispatch(endBattle(data));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, router, dispatch, isInitialized]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 md:p-12 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full bg-arena-orange/5 blur-[150px] -z-10 pointer-events-none" />

      {status === 'idle' || status === 'waiting' ? (
        <BattleLobby />
      ) : (
        <BattleRoom />
      )}
    </div>
  );
}
