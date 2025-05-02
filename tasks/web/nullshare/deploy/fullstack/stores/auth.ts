import { defineStore } from 'pinia';
import type { AuthState, LoginCredentials } from '~/types';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false
  }),
  
  actions: {
    async login(credentials: LoginCredentials) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: credentials
        });
        
        this.user = response.user;
        this.isAuthenticated = true;
        
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        
        return response;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    async fetchUser() {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          this.logout();
          return null;
        }
        
        const user = await $fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        this.user = user;
        this.isAuthenticated = true;
        
        return user;
      } catch (error) {
        console.error('Fetch user error:', error);
        this.logout();
        return null;
      }
    },
    
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  }
});
