import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { SocketProvider } from './context/SocketContext';
import Login from './authentication/Login';
import Register from './authentication/Register';
import Chat from './components/Chat';
import ProtectedRoute from './authentication/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </Provider>
  );
}

export default App;
