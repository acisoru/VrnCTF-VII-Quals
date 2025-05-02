<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Login to NullShare</h1>
    
    <UForm :state="form" class="max-w-md" @submit="handleLogin">
      <UFormGroup label="Username" name="username">
        <UInput v-model="form.username" />
      </UFormGroup>
      
      <UFormGroup label="Password" name="password">
        <UInput v-model="form.password" type="password" />
      </UFormGroup>
      
      <div class="mt-4">
        <UButton type="submit" color="blue" :loading="loading">Login</UButton>
      </div>
      
      <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
    </UForm>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  username: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await authStore.login({
      username: form.value.username,
      password: form.value.password
    });
    
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
