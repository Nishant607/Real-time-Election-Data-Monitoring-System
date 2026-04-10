import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('mockSession'); // Force clear any stuck mock session to be safe.

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        return { success: false, message: 'Invalid login credentials' };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    console.log("Logout initiated...");
    localStorage.removeItem('mockSession');
    setUser(null);
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Server logout failed', error);
    } finally {
      window.location.href = '/login';
    }
  };

  // Assume user is admin for now if they are logged in with this email
  const isAdmin = user?.role === 'Admin' || user?.user_metadata?.role === 'Admin' || user?.email === 'testadmin2004@yahoo.com' || ['admin', 'nishant'].includes(user?.user_metadata?.username?.toLowerCase()) || user?.email?.startsWith('nishant@');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
