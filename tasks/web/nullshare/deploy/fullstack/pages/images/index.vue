<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Your Images</h1>
    
    <div v-if="imagesStore.loading" class="flex justify-center my-8">
      <ULoading />
    </div>
    
    <div v-else-if="imagesStore.error" class="text-red-500 my-4">
      {{ imagesStore.error }}
    </div>
    
    <div v-else-if="imagesStore.images.length === 0" class="text-center my-8">
      <p class="text-gray-500 mb-4">You don't have any images yet</p>
      <UButton color="blue">Upload New Image</UButton>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="image in imagesStore.images" :key="image.id" class="border rounded-lg overflow-hidden">
        <img :src="image.url" :alt="image.title" class="w-full h-48 object-cover" />
        <div class="p-4">
          <h3 class="font-bold text-lg mb-1">{{ image.title }}</h3>
          <p class="text-gray-600 text-sm mb-2">{{ image.description }}</p>
          <div class="flex justify-between items-center">
            <UBadge v-if="image.isPrivate" color="gray">Private</UBadge>
            <UBadge v-else color="green">Public</UBadge>
            <UButton color="blue" size="sm" :to="`/images/${image.id}`">View</UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImagesStore } from '~/stores/images';
import { useAuthStore } from '~/stores/auth';
import { onMounted } from 'vue';

const imagesStore = useImagesStore();
const authStore = useAuthStore();
const router = useRouter();

// Redirect if not authenticated
onMounted(async () => {
  const user = await authStore.fetchUser();
  if (!user) {
    router.push('/login');
    return;
  }
  
  // Fetch images
  await imagesStore.fetchImages();
});
</script>
