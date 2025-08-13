const SummaryAPI = {
    // Auth endpoints
    register: {
        url: '/api/auth/register',
        method: 'POST'
    },
    login: {
        url: '/api/auth/login',
        method: 'POST'
    },
    fetchUser: {
        url: '/api/auth/user',
        method: 'GET'
    },
    logout: {
        url: '/api/auth/logout',
        method: 'POST'
    },
    refreshToken: {
        url: '/api/auth/refresh',
        method: 'POST'
    },
    
    // Chat endpoints
    fetchContacts: {
        url: '/api/chat/contacts',
        method: 'GET'
    },
    createChat: {
        url: '/api/chat/new',
        method: 'POST'
    },
    fetchUserChats: {
        url: '/api/chat/user',
        method: 'GET'
    },
    fetchChatMessages: {
        url: '/api/chat', // Will append /{chatId}/messages
        method: 'GET'
    },
    sendMessage: {
        url: '/api/chat', // Will append /{chatId}/message
        method: 'POST'
    }
};

export default SummaryAPI;