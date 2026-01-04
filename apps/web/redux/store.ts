import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import chatReducer from './features/chatSlice';
import battleReducer from './features/battleSlice';

import { authApi } from './services/authApi';
import { quizApi } from './services/quizApi';
import { examApi } from './services/examApi';
import { socialApi } from './services/socialApi';
import { chatApi } from './services/chatApi';
import { mathApi } from './services/mathApi';
import { aiApi } from './services/aiApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    battle: battleReducer,
    [authApi.reducerPath]: authApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [examApi.reducerPath]: examApi.reducer,
    [socialApi.reducerPath]: socialApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [mathApi.reducerPath]: mathApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      quizApi.middleware,
      examApi.middleware,
      socialApi.middleware,
      chatApi.middleware,
      mathApi.middleware,
      aiApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
