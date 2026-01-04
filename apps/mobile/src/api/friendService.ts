import api from './client';

export const friendApi = {
  getFriends: async (userId: string) => {
    const response = await api.get(`/social/friends/${userId}`);
    return response.data;
  },
  sendRequest: async (requestData: any) => {
    const response = await api.post('/social/friends/request', requestData);
    return response.data;
  },
  acceptRequest: async (friendshipId: string) => {
    const response = await api.post(`/social/friends/accept/${friendshipId}`);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/auth/users'); // Assuming this endpoint exists for discovery
    return response.data;
  },
};
