import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      // Create socket connection
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', {
        transports: ['websocket'],
        autoConnect: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  const joinChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('joinChat', chatId);
      console.log('Joined chat:', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('leaveChat', chatId);
      console.log('Left chat:', chatId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinChat,
    leaveChat,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
