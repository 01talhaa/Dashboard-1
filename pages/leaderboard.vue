<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :shop="shop" :menuItems="menuItems" />

    <!-- Main Content -->
    <div class="flex-1 overflow-auto transition-all duration-300">
      <!-- Header -->
      <header class="bg-white border-b sticky top-0 z-10">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-gray-800">Leaderboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/manageShop" class="w-9 h-9 rounded-full overflow-hidden cursor-pointer">
              <img v-if="shop.logo" :src="shop.logo" alt="Shop Logo" class="w-full h-full object-cover" />
              <img v-else src="/avatar-placeholder.png" alt="Default Logo" class="w-full h-full object-cover" />
            </router-link>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-4">
        <div class="container mx-auto">
          <!-- Search and Table Section -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <!-- Search Bar -->
            <div class="mb-6">
              <div class="relative">
                <input v-model="searchQuery" type="text" placeholder="Search users..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd" />
                  </svg>
                </span>
                <!-- Add loading indicator -->
                <span v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </span>
              </div>

              <!-- Add search feedback -->
              <div v-if="debouncedSearchQuery && !loading" class="mt-2 text-sm text-gray-600">
                Showing results for "{{ debouncedSearchQuery }}"
                <button @click="clearSearch" class="ml-2 text-blue-600 hover:text-blue-800">
                  Clear search
                </button>
              </div>
            </div>

            <!-- Loading and Error States -->
            <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {{ error }}
            </div>

            <!-- Leaderboard Table -->
            <div class="overflow-x-auto">
              <div v-if="loading" class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <table v-else class="w-full">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(entry, index) in paginatedLeaderboard" :key="entry.id"
                    class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-medium" :class="{
                        'text-yellow-600': entry.rank === 1,
                        'text-gray-400': entry.rank === 2,
                        'text-amber-700': entry.rank === 3,
                        'text-gray-900': entry.rank > 3
                      }">
                        #{{ entry.rank }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img class="h-10 w-10 rounded-full" :src="entry.user.avatar || '/avatar-placeholder.png'"
                            :alt="entry.user.name" />
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ entry.user.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-semibold text-blue-600">{{ entry.points }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm text-gray-900">{{ entry.reward }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(entry.timestamp) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Section -->
            <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">Show entries:</label>
                <select v-model="itemsPerPage"
                  class="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @change="handleItemsPerPageChange">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>

              <div class="flex items-center gap-2">
                <button @click="currentPage = 1" :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  First
                </button>
                <button @click="currentPage--" :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Previous
                </button>
                <span class="text-sm text-gray-700">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button @click="currentPage++" :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Next
                </button>
                <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import Sidebar from './Sidebar.vue';
import axios from 'axios';

// Refs for state management
const shop = ref({ name: '', logo: '' });
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const allLeaderboardData = ref([]); // Store all data
const debouncedSearchQuery = ref('');

// Add this computed property for filtered data
const filteredLeaderboard = computed(() => {
  if (!searchQuery.value) return allLeaderboardData.value;

  const query = searchQuery.value.toLowerCase();
  return allLeaderboardData.value.filter(entry =>
    entry.user.name.toLowerCase().includes(query) ||
    entry.points.toString().includes(query) ||
    entry.reward.toString().includes(query)
  );
});

// Update paginatedLeaderboard computed
const paginatedLeaderboard = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredLeaderboard.value.slice(start, end);
});

// Update total pages computed
const totalPages = computed(() =>
  Math.ceil(filteredLeaderboard.value.length / itemsPerPage.value)
);

// Menu items definition
const menuItems = [
  // { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  // { name: "Products", path: "/products", icon: "Package" },
  // { name: "Orders", path: "/orders", icon: "ShoppingCart" },
  { name: "Customers", path: "/customers", icon: "Users" },
  // { name: "Reports", path: "/reports", icon: "BarChart" },
  // { name: "Manage Shop", path: "/manageShop", icon: "Settings" },
  // { name: "Cupon", path: "/cupon", icon: "Tag" },
  // { name: "Invoicing", path: "/invoicing", icon: "FileText" },
  { name: "Lucky Spin", path: "/luckyspin", icon: "Award" },
  { name: "Leaderboard", path: "/leaderboard", icon: "Trophy" },
  { name: "Billing", path: "/billing", icon: "CreditCard" },
  { 
    name: "Transactions", 
    icon: "DollarSign",
    subMenu: [
      { name: "Transaction ID", path: "/transaction-id", icon: "CreditCard" },
      { name: "User Transactions", path: "/user-transactions", icon: "FileText" }
    ]
  },
];
// ...existing code...

// Update the fetchLeaderboard function with better error handling
const fetchLeaderboard = async () => {
  try {
    loading.value = true;
    error.value = null; // Reset error state

    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leaderboard`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      // Add timeout
      timeout: 10000
    });

    if (response.data.success) {
      const { result } = response.data.data;
      allLeaderboardData.value = result;
      totalItems.value = result.length;
      currentPage.value = 1;
    }
  } catch (err) {
    console.error('Leaderboard error details:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });

    // Handle specific error cases
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please login again.';
      // Redirect to login
      window.location.href = '/';
    } else if (err.response?.status === 500) {
      error.value = 'Server error. Please try again later.';
      // Set empty state
      allLeaderboardData.value = [];
      totalItems.value = 0;
    } else if (err.code === 'ECONNABORTED') {
      error.value = 'Request timed out. Please try again.';
    } else {
      error.value = 'Failed to fetch leaderboard. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

// Add retry mechanism for failed requests
const retryFetch = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fetchLeaderboard(currentPage.value);
      break;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Date formatter
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Event handlers
const handleItemsPerPageChange = () => {
  currentPage.value = 1;
  fetchLeaderboard(1);
};

// Watchers
watch([currentPage, itemsPerPage], () => {
  fetchLeaderboard(currentPage.value);
});

// Update the search watcher to use debounce
watch(searchQuery, (newQuery) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    debouncedSearchQuery.value = newQuery;
    currentPage.value = 1; // Reset to first page on search
  }, 300);
});

// Add cleanup 
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});

// Initialize component
onMounted(async () => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }
  await fetchLeaderboard();
});

// Add clearSearch method
const clearSearch = () => {
  searchQuery.value = '';
  debouncedSearchQuery.value = '';
  currentPage.value = 1;
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Add styles for rank colors */
.rank-1 {
  color: #FFD700;
}

/* Gold */
.rank-2 {
  color: #C0C0C0;
}

/* Silver */
.rank-3 {
  color: #CD7F32;
}

/* Bronze */
</style>