export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export type AuthMode = 'sign_in' | 'sign_up' | 'forgot_password' | 'verify_otp';
export type AuthMethod = 'email' | 'phone';
