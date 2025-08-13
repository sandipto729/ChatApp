import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser, fetchUserProfile } from '../store/authSlice';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import styles from './styles/Chat.module.scss';

const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchUserProfile());
  }, [dispatch, isAuthenticated, navigate]);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result) || logoutUser.rejected.match(result)) {
      navigate('/login');
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setSelectedUser(null);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedChat(null);
  };

  if (isLoading) {
    return (
      <div className={styles.chatLoading}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading Chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <header className={styles.chatHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.userDetails}>
            <h3>{user.name}</h3>
            <span className={styles.userStatus}>{user.status}</span>
          </div>
        </div>
        
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {/* Main Chat Interface */}
      <div className={styles.chatBody}>
        {/* Left Sidebar */}
        <ChatSidebar
          currentUser={user}
          onChatSelect={handleChatSelect}
          onUserSelect={handleUserSelect}
          selectedChat={selectedChat}
          selectedUser={selectedUser}
        />

        {/* Right Chat Area */}
        <ChatArea
          selectedChat={selectedChat}
          selectedUser={selectedUser}
          currentUser={user}
        />
      </div>
    </div>
  );
};

export default Chat;