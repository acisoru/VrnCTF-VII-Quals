import { defineStore } from 'pinia';
import type { ImagesState } from '~/types';

export const useImagesStore = defineStore('images', {
  state: (): ImagesState => ({
    images: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchImages() {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const images = await $fetch('/api/images', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        this.images = images;
        return images;
      } catch (error) {
        console.error('Fetch images error:', error);
        this.error = error instanceof Error ? error.message : 'Failed to fetch images';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchImageById(id: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const image = await $fetch(`/api/images/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        return image;
      } catch (error) {
        console.error(`Fetch image ${id} error:`, error);
        this.error = error instanceof Error ? error.message : `Failed to fetch image ${id}`;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
