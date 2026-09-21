import React, { createContext, useEffect, useState } from 'react';
import type { UserProfile, AuthSession } from '../../types/auth';
import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';

interface AuthContextType extends AuthSession {
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const LOCAL_STORAGE_USER_KEY = 'python_zero_local_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Пользователь',
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: session.user.created_at,
        };
        setUser(profile);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error('Supabase session fetch error:', err);
      setIsLoading(false);
    });

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Пользователь',
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: session.user.created_at,
        };
        setUser(profile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      } else {
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Email Sign In
  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      // Offline fallback: simulate successful login
      const mockProfile: UserProfile = {
        id: 'local-' + Date.now(),
        email,
        fullName: email.split('@')[0],
      };
      setUser(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
      return { error: null };
    }

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr) {
      setError(authErr.message);
      return { error: authErr.message };
    }

    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone,
        fullName: data.user.user_metadata?.full_name || email.split('@')[0],
        createdAt: data.user.created_at,
      };
      setUser(profile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    }

    return { error: null };
  };

  // Email Sign Up
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      // Offline fallback: simulate successful signup
      const mockProfile: UserProfile = {
        id: 'local-' + Date.now(),
        email,
        fullName: fullName || email.split('@')[0],
      };
      setUser(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
      return { error: null, needsConfirmation: false };
    }

    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authErr) {
      setError(authErr.message);
      return { error: authErr.message };
    }

    const needsConfirmation = !data.session && !!data.user;
    return { error: null, needsConfirmation };
  };

  // Phone Sign In / Sign Up (send OTP)
  const signInWithPhone = async (phone: string) => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Авторизация по SMS требует подключения SMS-шлюза в панели Supabase.' };
    }

    const { error: authErr } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (authErr) {
      setError(authErr.message);
      return { error: authErr.message };
    }

    return { error: null };
  };

  // Verify Phone OTP
  const verifyOtp = async (phone: string, token: string) => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      const mockProfile: UserProfile = {
        id: 'local-phone-' + Date.now(),
        phone,
        fullName: phone,
      };
      setUser(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
      return { error: null };
    }

    const { data, error: authErr } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (authErr) {
      setError(authErr.message);
      return { error: authErr.message };
    }

    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        phone: data.user.phone,
        fullName: data.user.user_metadata?.full_name || phone,
        createdAt: data.user.created_at,
      };
      setUser(profile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    }

    return { error: null };
  };

  // Sign In with Apple (OAuth)
  const signInWithApple = async () => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      const mockProfile: UserProfile = {
        id: 'apple-' + Date.now(),
        email: 'alex@icloud.com',
        fullName: 'Apple ID Пользователь',
      };
      setUser(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
      return { error: null };
    }

    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (authErr) {
      setError(authErr.message);
      return { error: authErr.message };
    }

    return { error: null };
  };

  // Reset Password
  const resetPassword = async (email: string) => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { error: null };
    }

    const { error: authErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#reset-password`,
    });

    if (authErr) {
      setError(authErr.message);
      return { error: authErr.message };
    }

    return { error: null };
  };

  // Sign Out
  const signOut = async () => {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithPhone,
        verifyOtp,
        signInWithApple,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export type { AuthContextType };
