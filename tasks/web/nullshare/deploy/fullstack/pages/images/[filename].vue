<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Image Viewer</h1>
    
    <div v-if="loading" class="flex justify-center my-8">
      <ULoading />
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="image" class="bg-white shadow rounded-lg overflow-hidden mb-6">
      <img :src="imageUrl" :alt="image.title || filename" class="w-full max-h-[500px] object-contain" />
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-2">{{ image.title || filename }}</h2>
        <p v-if="image.description" class="text-gray-600 mb-4">{{ image.description }}</p>
        <div class="flex justify-between items-center">
          <UBadge v-if="image.isPrivate" color="gray">Private</UBadge>
          <UBadge v-else color="green">Public</UBadge>
          <span class="text-sm text-gray-500">Uploaded: {{ formatDate(image.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <div class="flex space-x-4">
      <UButton to="/images" color="gray">Back to Images</UButton>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const filename = computed(() => route.params.filename);
const loading = ref(true);
const error = ref(null);
const image = ref(null);

// Compute the image URL
const imageUrl = computed(() => {
  if (image.value?.url) {
    return image.value.url;
  }
  // If no image data but we have a filename, construct a direct URL
  return `/images/${filename.value}`;
});

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Fetch image data
onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // First check if user is authenticated
    const user = await authStore.fetchUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Try to fetch image metadata if it exists in the database
    try {
      // Extract the image ID from the filename if it's a known format
      // This handles both database images and direct file access
      const filenameWithoutExt = filename.value.split('.')[0];
      
      // Special handling for specific images that might not be in the database
     {
        // For other images, try to fetch from API
        const imageData = await $fetch(`/api/images/${filenameWithoutExt}`);
        image.value = imageData;
      }
    } catch (err) {
      console.warn('Could not fetch image metadata, using direct file access');
      // If metadata fetch fails, we'll just use the direct file
      image.value = {
        title: filename.value,
        url: `/images/${filename.value}`,
        createdAt: new Date().toISOString(),
        isPrivate: false
      };
    }
  } catch (err) {
    console.error('Error loading image:', err);
    error.value = 'Failed to load image. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>
