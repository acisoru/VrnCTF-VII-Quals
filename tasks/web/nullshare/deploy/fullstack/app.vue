<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Initialize auth state on app load
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

// Check if user is already logged in
onMounted(async () => {
  try {
    await authStore.fetchUser();
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
});
</script>
