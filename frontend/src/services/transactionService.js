import api from '../api/axios';

const transactionService = {
    // Get user's transaction history with pagination
    getMyTransactions: async (page = 1, limit = 5) => {
        const response = await api.get(`/transaction/my-history?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get single transaction details
    getTransactionById: async (id) => {
        const response = await api.get(`/transaction/${id}`);
        return response.data;
    },

    // Create a new transaction
    createTransaction: async (data) => {
        const response = await api.post('/transaction', data);
        console.log(response.data)
        return response.data;
    }
};

export default transactionService;
