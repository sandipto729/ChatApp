import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../store/authSlice';
import styles from './styles/Register.module.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePic: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    
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
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const result = await dispatch(registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      profilePic: formData.profilePic
    }));

    if (registerUser.fulfilled.match(result)) {
      navigate('/chat');
    }
  };

  const isFormValid = () => {
    return formData.name && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword;
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1>Create Account</h1>
          <p>Join ChatApp and start connecting</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
          </div>

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
            <label htmlFor="profilePic">Profile Picture URL (Optional)</label>
            <input
              type="url"
              id="profilePic"
              name="profilePic"
              value={formData.profilePic}
              onChange={handleChange}
              placeholder="https://example.com/your-photo.jpg"
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
              placeholder="Create a password"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <span className={styles.passwordMismatch}>Passwords do not match</span>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.registerButton}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}>
                <span className={styles.spinner}></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className={styles.registerFooter}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.loginLink}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;