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
        <!-- Remove this outer template that was creating duplicates -->
        <div v-for="item in filteredMenuItems" :key="item.name" class="mb-1">
          <!-- If item has subMenu, make it a dropdown -->
          <div v-if="item.subMenu" class="relative">
            <!-- Main menu item with separate click handlers -->
            <div class="flex items-center w-full">
              <!-- Link part (takes up most of the button) -->
              <router-link 
                :to="item.path"
                class="flex items-center flex-grow px-3 py-2 text-left text-gray-300 hover:bg-slate-700 rounded-md"
                :class="{ 'bg-slate-700 text-white': isActiveRoute(item.path) }"
              >
                <span class="mr-2">
                  <component :is="getIconComponent(item.icon)" class="h-5 w-5" />
                </span>
                <span class="flex-1">{{ item.name }}</span>
              </router-link>
              
              <!-- Dropdown toggle button (separate clickable area) -->
              <button 
                @click="toggleSubMenu(item)"
                class="px-2 py-2 text-gray-300 hover:bg-slate-700 rounded-r-md"
              >
                <svg 
                  class="h-5 w-5 transform transition-transform duration-200" 
                  :class="{ 'rotate-180': openSubMenus[item.name] }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <!-- Submenu items -->
            <div 
              v-show="openSubMenus[item.name]"
              class="pl-6 mt-1 space-y-1 overflow-hidden transition-all duration-300"
            >
              <router-link 
                v-for="subItem in item.subMenu" 
                :key="subItem.path" 
                :to="subItem.path"
                class="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded-md"
                :class="{ 'bg-slate-600 text-white': isActiveRoute(subItem.path) }"
              >
                <span class="mr-2">
                  <component :is="getIconComponent(subItem.icon)" class="h-4 w-4" />
                </span>
                {{ subItem.name }}
              </router-link>
            </div>
          </div>
          
          <!-- Regular menu item (without submenu) -->
          <router-link 
            v-else 
            :to="item.path" 
            class="flex items-center px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-md"
            :class="{ 'bg-slate-700 text-white': isActiveRoute(item.path) }"
          >
            <span class="mr-2">
              <!-- Dynamic icon rendering based on icon name -->
              <component :is="getIconComponent(item.icon)" class="h-5 w-5" />
            </span>
            {{ item.name }}
          </router-link>
        </div>
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
import { ref, computed, h } from 'vue';
import { useRoute } from 'vue-router';

// Props - only define once!
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

// Add these to your script
const route = useRoute();
const openSubMenus = ref({});

// Toggle submenu open/closed
const toggleSubMenu = (item) => {
  openSubMenus.value[item.name] = !openSubMenus.value[item.name];
};

// Check if route is active
const isActiveRoute = (path) => {
  return route.path === path;
};

// Function to get icon component
const getIconComponent = (iconName) => {
  // Return the appropriate icon SVG based on iconName
  switch (iconName) {
    case 'Users':
      return {
        render() {
          return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
            h('circle', { cx: '9', cy: '7', r: '4' }),
            h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
            h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
          ]);
        }
      };
    case 'Award':
      return {
        render() {
          return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('circle', { cx: '12', cy: '8', r: '7' }),
            h('polyline', { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' })
          ]);
        }
      };
    case 'Trophy':
      return {
        render() {
          return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('path', { d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' }),
            h('path', { d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' }),
            h('path', { d: 'M4 22h16' }),
            h('path', { d: 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' }),
            h('path', { d: 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' }),
            h('path', { d: 'M18 2H6v7a6 6 0 0 0 12 0V2Z' })
          ]);
        }
      };
    case 'CreditCard':
      return {
        render() {
          return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('rect', { x: '1', y: '4', width: '22', height: '16', rx: '2', ry: '2' }),
            h('line', { x1: '1', y1: '10', x2: '23', y2: '10' })
          ]);
        }
      };
    case 'DollarSign':
      return {
        render() {
          return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('line', { x1: '12', y1: '1', x2: '12', y2: '23' }),
            h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
          ]);
        }
      };
    case 'FileText':
      return {
        render() {
          return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
            h('polyline', { points: '14 2 14 8 20 8' }),
            h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
            h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
            h('polyline', { points: '10 9 9 9 8 9' })
          ]);
        }
      };
    // Add more icon cases here as needed
    default:
      // Default icon for any undefined icon names
      return {
        render() {
          return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('circle', { cx: '12', cy: '12', r: '10' })
          ]);
        }
      };
  }
};
</script>