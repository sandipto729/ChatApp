import { useState, useEffect } from 'react';
import SummaryAPI from '../common/api';
import { postRequest, getRequest } from '../common/request';
import { useSocket } from '../context/SocketContext';
import styles from './styles/ChatArea.module.scss';

const ChatArea = ({ selectedChat, selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { socket, joinChat, leaveChat, isConnected } = useSocket();

  // Create or get chat when user is selected
  useEffect(() => {
    if (selectedUser) {
      createOrGetChat(selectedUser.id);
    }
  }, [selectedUser]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      setChatData(selectedChat);
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  // Socket connection and message listener
  useEffect(() => {
    if (socket && chatData) {
      // Join the chat room
      joinChat(chatData._id);

      // Listen for new messages
      const handleNewMessage = (newMessage) => {
        console.log('Received new message via socket:', newMessage);
        // Only add message if it's not from the current user (to avoid duplicates)
        if (newMessage.sender._id !== currentUser.id) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      };

      socket.on('messageReceived', handleNewMessage);

      // Cleanup function
      return () => {
        socket.off('messageReceived', handleNewMessage);
        leaveChat(chatData._id);
      };
    }
  }, [socket, chatData, currentUser.id, joinChat, leaveChat]);

  const createOrGetChat = async (userId) => {
    try {
      setLoading(true);
      const response = await postRequest(SummaryAPI.createChat, { userId });
      console.log('Created/Found chat:', response);
      setChatData(response.chat || response);
      if (response.chat?._id) {
        fetchMessages(response.chat._id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      // Create dynamic URL for chat messages
      const messagesEndpoint = {
        url: `/api/chat/${chatId}/messages`,
        method: 'GET'
      };
      const response = await getRequest(messagesEndpoint);
      console.log('Messages data:', response);
      setMessages(response.messages || response || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = () => {
    if (selectedUser) return selectedUser;
    if (chatData && chatData.users) {
      return chatData.users.find(user => user.id !== currentUser.id);
    }
    return null;
  };

  const sendMessage = async () => {
    console.log('sendMessage called');
    console.log('messageInput value:', messageInput);
    console.log('messageInput type:', typeof messageInput);
    
    const trimmedMessage = messageInput.trim();
    console.log('trimmedMessage value:', trimmedMessage);
    console.log('trimmedMessage length:', trimmedMessage.length);
    
    if (!trimmedMessage || !chatData || sendingMessage) {
      console.log('Early return - conditions:', {
        trimmedMessage: !!trimmedMessage,
        chatData: !!chatData,
        sendingMessage
      });
      return;
    }

    setSendingMessage(true);
    try {
      const sendMessageEndpoint = {
        url: `${SummaryAPI.sendMessage.url}/${chatData._id}/message`,
        method: 'POST'
      };
      const requestBody = { content: trimmedMessage };
      
      console.log('Sending request to:', sendMessageEndpoint);
      console.log('Request body:', requestBody);
      
      const response = await postRequest(sendMessageEndpoint, requestBody);

      console.log("SendMessage response:", response);

      // Add the new message to the messages array
      if (response.messageData) {
        setMessages(prevMessages => [...prevMessages, response.messageData]);
      }

      // Clear the input
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatMessageDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!selectedChat && !selectedUser) {
    return (
      <div className={styles.emptyChatArea}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h3>Welcome to ChatApp</h3>
          <p>Select a chat from the sidebar or choose a user to start messaging</p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  if (!otherUser) {
    return (
      <div className={styles.emptyChatArea}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>❓</div>
          <h3>Chat not found</h3>
          <p>Unable to load chat information</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.emptyChatArea}>
        <div className={styles.emptyState}>
          <div className={styles.spinner}></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={styles.chatArea}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {otherUser.profilePic ? (
              <img src={otherUser.profilePic} alt={otherUser.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.userDetails}>
            <h3>{otherUser.name}</h3>
            <span className={styles.userStatus}>
              {isConnected ? (otherUser.status || 'Online') : 'Connecting...'}
              {isConnected && <span className={styles.onlineIndicator}>🟢</span>}
            </span>
          </div>
        </div>
        
        <div className={styles.chatActions}>
          <button className={styles.actionButton} title="Call">
            📞
          </button>
          <button className={styles.actionButton} title="Video Call">
            📹
          </button>
          <button className={styles.actionButton} title="More Options">
            ⋮
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesContainer}>
        {error && (
          <div className={styles.errorMessage}>
            <p>Error: {error}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className={styles.noMessages}>
            <div className={styles.noMessagesIcon}>💭</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                <div className={styles.dateHeader}>
                  <span className={styles.dateLabel}>{date}</span>
                </div>
                
                {dateMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`${styles.messageItem} ${
                      message.sender._id === currentUser.id
                        ? styles.sentMessage
                        : styles.receivedMessage
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.messageText}>
                        {message.content}
                      </div>
                      <div className={styles.messageTime}>
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <div className={styles.messageInputArea}>
        <div className={styles.inputContainer}>
          <button className={styles.attachButton} title="Attach File">
            📎
          </button>
          
          <input
            type="text"
            placeholder={`Message ${otherUser.name}...`}
            className={styles.messageInput}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!chatData || sendingMessage}
          />
          
          <button className={styles.emojiButton} title="Emoji">
            😊
          </button>
          
          <button 
            className={styles.sendButton} 
            title="Send Message" 
            onClick={sendMessage}
            disabled={!messageInput.trim() || !chatData || sendingMessage}
          >
            {sendingMessage ? '⏳' : '➤'}
          </button>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            <p>❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
