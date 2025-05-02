export interface User {
  id: string;
  username: string;
  password?: string; // Make password optional
  isAdmin: boolean;
}

export interface Image {
  id: string;
  userId: string;
  title: string;
  description: string;
  url: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ImagesState {
  images: Image[];
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
