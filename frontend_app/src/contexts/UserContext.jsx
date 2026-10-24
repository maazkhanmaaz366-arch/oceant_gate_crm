import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Check local storage for initial auth state (default to true for seamless mobile & remote access)
  const storedAuth = localStorage.getItem('isAuthenticated') !== 'false';
  const storedRole = localStorage.getItem('userRole') || 'Admin';
  
  const [isAuthenticated, setIsAuthenticated] = useState(storedAuth);
  const [user, setUser] = useState({
    name: 'Demo Admin',
    email: 'admin@oceangate.ae',
    role: storedRole
  });

  // Mock login function
  const login = async (email, password) => {
    // In a real app, this would be an API call to /api/auth/login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@oceangate.ae' || email === 'admin') {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          changeRole('Admin');
          resolve({ success: true, role: 'Admin' });
        } else if (email === 'sales@oceangate.ae' || email === 'sales') {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          changeRole('Sales');
          resolve({ success: true, role: 'Sales' });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'false');
  };

  const changeRole = (newRole) => {
    setUser(prev => ({ ...prev, role: newRole }));
    localStorage.setItem('userRole', newRole);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, logout, changeRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
