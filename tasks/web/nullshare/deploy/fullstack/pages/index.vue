<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Welcome to NullShare</h1>
    
    <div v-if="authStore.isAuthenticated">
      <p class="mb-4">You are logged in as {{ authStore.user?.username }}</p>
      <UButton to="/images" color="blue">View Images</UButton>
    </div>
    <div v-else>
      <p class="mb-4">Please log in to access your images</p>
      <UButton to="/login" color="blue">Login</UButton>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { onMounted } from 'vue';

const authStore = useAuthStore();

// Try to fetch user data on page load
onMounted(async () => {
  await authStore.fetchUser();
});
</script>
