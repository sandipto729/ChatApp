import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import styles from './styles/Login.module.scss';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [dispatch, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    const result = await dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));

    if (loginUser.fulfilled.match(result)) {
      navigate('/chat');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Welcome Back</h1>
          <p>Sign in to your ChatApp account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}>
                <span className={styles.spinner}></span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className={styles.registerLink}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;