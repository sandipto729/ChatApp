import { useState, useEffect } from 'react';
import SummaryAPI from '../common/api';
import fetchDetails from '../common/request';
import styles from './styles/UserList.module.scss';

const UserList = ({ currentUser, onUserSelect, selectedUser, searchQuery }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchDetails(SummaryAPI.fetchContacts);
      console.log('Users data:', response);
      
      // Filter out current user
      const filteredUsers = (response.contacts || response || []).filter(
        user => user.id !== currentUser.id
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (user) => {
    onUserSelect(user);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading users: {error}</p>
        <button onClick={fetchUsers} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>
          {searchQuery
            ? `No users found matching "${searchQuery}"`
            : 'No users available'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={styles.userList}>
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className={`${styles.userItem} ${
            selectedUser?.id === user.id ? styles.selected : ''
          }`}
          onClick={() => handleUserClick(user)}
        >
          <div className={styles.userAvatar}>
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userEmail}>{user.email}</div>
            <div className={styles.userStatus}>{user.status}</div>
          </div>

          <div className={styles.userActions}>
            <span className={styles.startChatHint}>Click to start chat</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
