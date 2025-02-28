<template>
  <!-- Change from absolute positioning to flex layout -->
  <aside
    class="w-2/5 sm:w-64 bg-slate-800 text-white transition-all duration-300 flex-shrink-0 overflow-auto flex flex-col">
    <!-- Add a flex-1 wrapper around the main content -->
    <div class="flex-1">
      <div class="p-3 sm:p-5">
        <div class="flex items-center gap-2 text-sm sm:text-xl font-bold">
          <div class="w-6 sm:w-8 h-6 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 sm:h-5 w-4 sm:w-5 text-white" viewBox="0 0 20 20"
              fill="currentColor">
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span class="ml-2">{{ shop.name ? shop.name + "'s" : 'ACTIVE' }}<span
              class="text-red-500">Platform</span></span>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="px-3 sm:px-5 mt-2 sm:mt-6">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input v-model="searchQuery" type="search" placeholder="Search menu..."
            class="w-full pl-8 pr-3 py-2 bg-slate-700 rounded-md text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      <!-- Menu Items -->
      <nav class="mt-4 sm:mt-6 mb-16"> <!-- Add bottom margin to prevent overlap -->
        <template v-for="(item, index) in filteredMenuItems" :key="index">
          <router-link :to="item.path"
            class="flex items-center px-3 sm:px-5 py-2 sm:py-3 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 rounded-md mx-2 mb-1">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="ml-3 text-sm font-medium">{{ item.name }}</span>
          </router-link>
        </template>
      </nav>
    </div>

    <!-- Remove absolute positioning, add padding -->
    <div class="w-full p-3 sm:p-5 border-t border-slate-700 mt-auto">
      <router-link to="/" class="flex items-center text-red-400 hover:text-red-300 transition-colors duration-200"
        @click.prevent="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="text-sm font-medium">Logout</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  shop: {
    type: Object,
    required: true
  },
  menuItems: {
    type: Array,
    required: true
  }
});

// Emits
const emit = defineEmits(['logout']);

const searchQuery = ref("");
const filteredMenuItems = computed(() => {
  return props.menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};
</script>