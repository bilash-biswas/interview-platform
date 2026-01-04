import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  recipientId?: string;
  roomId: string;
  status?: string;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  currentRoom: string | null;
  onlineUsers: number;
}

const initialState: ChatState = {
  messages: [],
  currentRoom: null,
  onlineUsers: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message | any>) => {
      const msg = action.payload;
      const id = msg.id || msg._id;
      const exists = state.messages.some(m => (m.id === id || (m as any)._id === id));
      if (!exists && id) {
        state.messages.push({ ...msg, id });
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setRoom: (state, action: PayloadAction<string>) => {
      state.currentRoom = action.payload;
      state.messages = [];
    },
    setOnlineUsers: (state, action: PayloadAction<number>) => {
        state.onlineUsers = action.payload;
    }
  },
});

export const { addMessage, setMessages, setRoom, setOnlineUsers } = chatSlice.actions;
export default chatSlice.reducer;
