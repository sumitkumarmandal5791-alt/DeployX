import api from '../api/axios';

const badgeService = {
    // Get all available badges
    getAllBadges: async () => {
        const response = await api.get('/badges');
        return response.data;
    },

    // Get user stats (including points, level, and earned badges)
    getUserStats: async () => {
        const response = await api.get('/user/stats');
        return response.data;
    }
};

export default badgeService;
