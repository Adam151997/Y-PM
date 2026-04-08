export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
}

export interface AuthState {
  user: SafeUser | null;
  isLoading: boolean;
}