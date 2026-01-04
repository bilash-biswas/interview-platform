import api from './client';

export const socialApi = {
  getFeed: async () => {
    const response = await api.get('/social/posts/feed');
    return response.data;
  },
  likePost: async (postId: string, userId: string) => {
    const response = await api.post(`/social/posts/${postId}/like`, { userId });
    return response.data;
  },
  addComment: async (postId: string, commentData: any) => {
    const response = await api.post(`/social/posts/${postId}/comments`, commentData);
    return response.data;
  },
};
