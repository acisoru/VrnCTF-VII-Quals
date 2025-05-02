<template>
  <div>
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-2xl font-bold text-blue-600">NullShare</NuxtLink>
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-4">
          <span>Welcome, {{ authStore.user?.username }}</span>
          <UButton color="gray" @click="logout">Logout</UButton>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
    
    <footer class="bg-gray-100 py-6">
      <div class="container mx-auto px-4 text-center text-gray-600">
        <p>NullShare - CTF Challenge</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
