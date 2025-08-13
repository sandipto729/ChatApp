import { useState, useEffect } from 'react';
import SummaryAPI from '../common/api';
import fetchDetails from '../common/request';
import { useSocket } from '../context/SocketContext';
import styles from './styles/ChatList.module.scss';

const ChatList = ({ currentUser, onChatSelect, selectedChat, searchQuery }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    fetchChats();
  }, []);

  // Listen for new messages via socket to update chat list
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        console.log('ChatList received new message:', newMessage);
        
        // Update the chat list with the new latest message
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat._id === newMessage.chat) {
              return {
                ...chat,
                latestMessage: newMessage,
                updatedAt: newMessage.createdAt
              };
            }
            return chat;
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); 
        });
      };

      socket.on('messageReceived', handleNewMessage);

      return () => {
        socket.off('messageReceived', handleNewMessage);
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetchDetails(SummaryAPI.fetchUserChats);
      console.log('Chats data:', response);
      setChats(response.chats || response || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (chat) => {
    return chat.users.find(user => user._id !== currentUser.id);
  };

  const getLastMessage = (chat) => {
    if (!chat.latestMessage) return 'No messages yet';
    return chat.latestMessage.content || 'Media';
  };

  const getLastMessageTime = (chat) => {
    if (!chat.latestMessage) return '';
    const date = new Date(chat.latestMessage.createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    if (!otherUser) return false;
    
    return (
      otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLastMessage(chat).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleChatClick = (chat) => {
    onChatSelect(chat);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading chats: {error}</p>
        <button onClick={fetchChats} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (filteredChats.length === 0) {
    return (
      <div className={styles.empty}>
        <p>
          {searchQuery
            ? `No chats found matching "${searchQuery}"`
            : 'No chats yet. Start a conversation from All Users tab!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={styles.chatList}>
      {filteredChats.map((chat) => {
        const otherUser = getOtherUser(chat);
        if (!otherUser) return null;

        return (
          <div
            key={chat._id}
            className={`${styles.chatItem} ${
              selectedChat?._id === chat._id ? styles.selected : ''
            }`}
            onClick={() => handleChatClick(chat)}
          >
            <div className={styles.chatAvatar}>
              {otherUser.profilePic ? (
                <img src={otherUser.profilePic} alt={otherUser.name} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className={styles.chatInfo}>
              <div className={styles.chatHeader}>
                <div className={styles.chatName}>{otherUser.name}</div>
                <div className={styles.chatTime}>
                  {getLastMessageTime(chat)}
                </div>
              </div>
              
              <div className={styles.chatPreview}>
                <div className={styles.lastMessage}>
                  {getLastMessage(chat)}
                </div>
                {chat.unreadCount > 0 && (
                  <div className={styles.unreadBadge}>
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
