import { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Get user data
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password, name, favBook, favMeal) => {
    try {
      const res = await axios.post('/api/auth/register', { 
        email, 
        password, 
        name,
        securityQuestions: [
          {
            question: "What is your favorite book?",
            answer: favBook.toLowerCase()
          },
          {
            question: "What is your favorite meal?",
            answer: favMeal.toLowerCase()
          }
        ]
      });
      
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 