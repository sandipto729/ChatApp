const express=require('express');
const routes=express.Router();
const { register, login, fetchUser, logout, refreshToken, verifyAccessToken } = require('./../controller/userAuth');
const { fetchContacts, newChat, userChatFetch, fetchChatMessage, saveMessage} =require('./../controller/chat');

// Auth routes
routes.post('/auth/register', register);
routes.post('/auth/login', login);
routes.get('/auth/user', verifyAccessToken, fetchUser);
routes.post('/auth/logout', verifyAccessToken, logout);
routes.post('/auth/refresh', refreshToken);

// Chat routes
routes.get('/chat/contacts', verifyAccessToken, fetchContacts);
routes.post('/chat/new', verifyAccessToken, newChat);
routes.get('/chat/user', verifyAccessToken, userChatFetch);
routes.get('/chat/:chatId/messages', verifyAccessToken, fetchChatMessage);
routes.post('/chat/:chatId/message', verifyAccessToken, saveMessage);

module.exports = routes;
