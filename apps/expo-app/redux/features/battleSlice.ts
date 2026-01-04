import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BattlePlayer {
    userId: string;
    username: string;
    score: number;
    currentIdx: number;
}

interface BattleState {
    battleId: string | null;
    opponent: string | null;
    questions: any[];
    players: Record<string, { userId: string; username: string; score: number; currentIdx: number }>;
    currentIdx: number;
    status: 'idle' | 'waiting' | 'active' | 'finished';
}

const initialState: BattleState = {
    battleId: null,
    opponent: null,
    questions: [],
    players: {},
    currentIdx: 0,
    status: 'idle',
};

const battleSlice = createSlice({
    name: 'battle',
    initialState,
    reducers: {
        setWaiting: (state) => {
            state.status = 'waiting';
        },
        battleStart: (state, action: PayloadAction<{ battleId: string, opponent: string, questions: any[] }>) => {
            state.battleId = action.payload.battleId;
            state.opponent = action.payload.opponent;
            state.questions = action.payload.questions;
            state.currentIdx = 0;
            state.status = 'active';
            state.players = {};
        },
        battleUpdate: (state, action: PayloadAction<{ players: Record<string, BattlePlayer>, currentIdx?: number }>) => {
            state.players = action.payload.players;
            if (typeof action.payload.currentIdx === 'number') {
                state.currentIdx = action.payload.currentIdx;
            }
        },
        endBattle: (state, action: PayloadAction<{ players: Record<string, BattlePlayer> }>) => {
            state.players = action.payload.players;
            state.status = 'finished';
        },
        resetBattle: (state) => {
            return initialState;
        }
    },
});

export const { setWaiting, battleStart, battleUpdate, endBattle, resetBattle } = battleSlice.actions;
export default battleSlice.reducer;
