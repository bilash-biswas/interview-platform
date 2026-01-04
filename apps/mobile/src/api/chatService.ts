import api from './client';

export const chatApi = {
  getMessages: async (recipientId: string) => {
    const response = await api.get(`/chat/messages/${recipientId}`);
    return response.data;
  },
  sendMessage: async (messageData: any) => {
    const response = await api.post('/chat/send', messageData);
    return response.data;
  },
};
