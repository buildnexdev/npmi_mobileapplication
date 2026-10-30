import { apiClient } from './apiClient';

export const communityApi = {
  listFeed: async (params?: { district_id?: number; limit?: number }) => {
    const res = await apiClient.get('/feed', { params });
    return res.data?.data || [];
  },

  createPost: async (body: string, imageUrl?: string) => {
    const res = await apiClient.post('/feed', { body, image_url: imageUrl || undefined });
    return res.data?.data;
  },

  toggleFeedLike: async (postId: number) => {
    const res = await apiClient.post(`/feed/${postId}/like`);
    return res.data?.data;
  },

  listReels: async () => {
    const res = await apiClient.get('/reels');
    return res.data?.data || [];
  },

  toggleReelLike: async (reelId: number) => {
    const res = await apiClient.post(`/reels/${reelId}/like`);
    return res.data?.data;
  },

  recordReelView: async (reelId: number) => {
    await apiClient.post(`/reels/${reelId}/view`);
  },

  eventRsvp: async (eventId: number, status: 'GOING' | 'INTERESTED' | 'NOT_GOING') => {
    const res = await apiClient.post(`/events/${eventId}/rsvp`, { status });
    return res.data?.data;
  },

  eventCheckIn: async (eventId: number) => {
    const res = await apiClient.post(`/events/${eventId}/check-in`);
    return res.data?.data;
  },

  myEventRsvp: async (eventId: number) => {
    const res = await apiClient.get(`/events/${eventId}/rsvp/me`);
    return res.data?.data;
  },

  listSurveys: async () => {
    const res = await apiClient.get('/surveys');
    return res.data?.data || [];
  },

  getSurvey: async (id: number) => {
    const res = await apiClient.get(`/surveys/${id}`);
    return res.data?.data;
  },

  submitSurvey: async (id: number, answers: any[]) => {
    const res = await apiClient.post(`/surveys/${id}/submit`, { answers });
    return res.data?.data;
  },
};
