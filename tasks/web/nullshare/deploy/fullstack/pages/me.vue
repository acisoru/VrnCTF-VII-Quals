<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">My Profile</h1>
    
    <div v-if="authStore.isAuthenticated">
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">User Information</h2>
        <div class="space-y-3">
          <div>
            <span class="text-gray-600">Username:</span>
            <span class="font-medium ml-2">{{ authStore.user?.username }}</span>
          </div>
          <div>
            <span class="text-gray-600">Admin:</span>
            <span class="font-medium ml-2">{{ authStore.user?.isAdmin ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex space-x-4">
        <UButton to="/" color="gray">Back to Home</UButton>
        <UButton to="/images" color="blue">My Images</UButton>
      </div>
    </div>
    <div v-else>
      <p class="text-red-500 mb-4">You need to be logged in to view this page</p>
      <UButton to="/login" color="blue">Login</UButton>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

// Redirect if not authenticated
onMounted(async () => {
  const user = await authStore.fetchUser();
  if (!user) {
    router.push('/login');
  }
});
</script>
