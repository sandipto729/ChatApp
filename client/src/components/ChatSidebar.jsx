import { useState, useEffect } from 'react';
import UserList from './UserList';
import ChatList from './ChatList';
import styles from './styles/ChatSidebar.module.scss';

const ChatSidebar = ({ currentUser, onChatSelect, onUserSelect, selectedChat, selectedUser }) => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={styles.sidebar}>
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <h2>Messages</h2>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'chats' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          Chats
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.sidebarContent}>
        {activeTab === 'chats' ? (
          <ChatList
            currentUser={currentUser}
            onChatSelect={onChatSelect}
            selectedChat={selectedChat}
            searchQuery={searchQuery}
          />
        ) : (
          <UserList
            currentUser={currentUser}
            onUserSelect={onUserSelect}
            selectedUser={selectedUser}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
