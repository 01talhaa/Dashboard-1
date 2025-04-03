<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar :shop="shop" :menuItems="menuItems" @logout="handleLogout" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b shadow-sm sticky top-0 z-10">
        <div class="flex items-center justify-between px-6 py-3">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold text-gray-800">Payment Request</h2>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/manageShop"
              class="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 shadow-sm hover:border-red-500 transition-all duration-200">
              <img v-if="shop.logo" :src="shop.logo" alt="Shop Logo" class="w-full h-full object-cover" />
              <img v-else src="/avatar-placeholder.png" alt="Default Logo" class="w-full h-full object-cover" />
            </router-link>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="flex-1 overflow-auto bg-gray-50">
        <div class="container mx-auto px-4 py-6">
          <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 class="text-2xl font-bold text-gray-800 mb-2 sm:mb-0"></h1>
              <button @click="refreshData"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :disabled="loading">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ loading ? 'Refreshing...' : 'Refresh Data' }}
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-600">Manage your customer information and payment status</p>
          </div>

          <!-- Table Section -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
              <svg class="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <p class="mt-2 text-gray-600">Loading customer data...</p>
            </div>
            <div v-else-if="error" class="p-8 text-center">
              <svg class="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-red-600 font-medium">{{ error }}</p>
              <button @click="fetchCustomers"
                class="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700">
                Try Again
              </button>
            </div>
            <div v-else-if="!customers.length" class="p-8 text-center">
              <svg class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                </path>
              </svg>
              <p class="text-gray-600 font-medium">No customer data available</p>
              <button @click="fetchCustomers"
                class="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700">
                Refresh Data
              </button>
            </div>
            <template v-else>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th class="px-6 py-3">ID</th>
                      <th class="px-6 py-3">Name</th>
                      <th class="px-6 py-3">Phone</th>
                      <th class="px-6 py-3">Amount</th>
                      <th class="px-6 py-3">Method</th>
                      <th class="px-6 py-3">Status</th>
                      <th class="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <!-- Replace the v-for in the table body -->
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="customer in customers" :key="customer.id"
                      class="hover:bg-gray-50 transition-colors duration-150 customer-row">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ customer.id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ customer.user.name }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.mobile_number }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {{ (customer.amount) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {{ (customer.payment_method) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="[
                          customer.status === 'paid'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300',
                          'px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full'
                        ]">
                          {{ customer.status || 'due' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select v-model="customer.status" @change="updateStatus(customer)"
                          :disabled="customer.status === 'paid'"
                          class="px-3 py-1.5 text-sm rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                          <option value="due">Due</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Add this pagination component after the table -->
              <div class="flex items-center justify-between px-6 py-4 bg-white border-t">
                <!-- Pagination Info -->
                <div class="text-sm text-gray-500">
                  Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to
                  {{ Math.min(currentPage * itemsPerPage, totalItems) }} of
                  {{ totalItems }} entries
                </div>

                <!-- Pagination Controls -->
                <div class="flex items-center space-x-2">
                  <button @click="previousPage" :disabled="currentPage <= 1"
                    class="px-4 py-2 border rounded-md text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50">
                    Previous
                  </button>

                  <span class="mx-2">
                    Page {{ currentPage }} of {{ lastPage }}
                  </span>

                  <button @click="nextPage" :disabled="currentPage >= lastPage"
                    class="px-4 py-2 border rounded-md text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </main>

      <!-- Toast Notification -->
      <transition name="toast">
        <div v-if="showToast" class="fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center toast"
          :class="toastClass">
          <span v-if="toastStatus === 'success' || toastStatus === 'paid'" class="mr-2">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
          </span>
          <span v-else-if="toastStatus === 'error' || toastStatus === 'due'" class="mr-2">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </span>
          <span class="text-white text-sm font-medium">{{ toastMessage }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from './Sidebar.vue'; // Import the Sidebar component

// State
const shop = ref({ logo: null, name: null });
const customers = ref([]);
const loading = ref(false);
const error = ref(null);
const debugInfo = ref(null);
const showToast = ref(false);
const toastMessage = ref('');
const toastStatus = ref('');

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


const toastClass = computed(() => ({
  'bg-green-600 ring-1 ring-green-500/10': toastStatus.value === 'success' || toastStatus.value === 'paid',
  'bg-red-600 ring-1 ring-red-500/10': toastStatus.value === 'error' || toastStatus.value === 'due'
}));

// Add these refs in the script setup section after existing refs
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(0);
const totalItems = ref(0);
const lastPage = ref(0);

// Update the fetchCustomers function to handle refresh
const fetchCustomers = async (page = 1, isRefresh = false) => {
  loading.value = true;
  error.value = null;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Show loading state for refresh
    if (isRefresh) {
      customers.value = [];
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/withdraws?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      customers.value = data.data.result;
      currentPage.value = parseInt(data.data.meta.page);
      totalItems.value = parseInt(data.data.meta.total);
      lastPage.value = parseInt(data.data.meta.totalPage);
      itemsPerPage.value = parseInt(data.data.meta.limit);

      if (isRefresh) {
        showToastMessage('Data refreshed successfully', 'success');
      }
    }
  } catch (err) {
    error.value = err.message;
    console.error('Error:', err);
    if (isRefresh) {
      showToastMessage('Failed to refresh data', 'error');
    }
  } finally {
    loading.value = false;
  }
};

// Add a separate refresh function
const refreshData = () => {
  return fetchCustomers(currentPage.value, true);
};

// Update the navigation methods
const nextPage = async () => {
  console.log('Current page:', currentPage.value, 'Last page:', lastPage.value);
  if (currentPage.value < lastPage.value) {
    await fetchCustomers(currentPage.value + 1);
  }
};

const previousPage = async () => {
  console.log('Current page:', currentPage.value);
  if (currentPage.value > 1) {
    await fetchCustomers(currentPage.value - 1);
  }
};

// Methods
const formatBalance = (balance) => {
  return parseFloat(balance || 0).toFixed(2);
};

const getStatusClass = (status) => {
  return status === 'paid'
    ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm'
    : 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm';
};

// Show toast message
const showToastMessage = (message, status) => {
  toastMessage.value = message;
  toastStatus.value = status;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// Update customer status (client-side only since the API endpoint doesn't exist)
const updateStatus = async (customer) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/withdraws/${customer.id}/approve`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();
    showToastMessage(data.message || `Status updated to ${customer.status}`, customer.status);
  } catch (err) {
    showToastMessage(err.message, 'error');
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

// Lifecycle
onMounted(async () => {
  // Load shop data
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }

  // Fetch customers
  await fetchCustomers();

  // Apply any saved statuses from localStorage
  try {
    const savedStatuses = JSON.parse(localStorage.getItem('customerStatuses') || '{}');

    // Update statuses for loaded customers if we have saved values
    customers.value.forEach(customer => {
      if (savedStatuses[customer.id]) {
        customer.status = savedStatuses[customer.id];
      }
    });
  } catch (e) {
    console.error('Could not restore statuses from localStorage:', e);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.toast {
  max-width: 350px;
  min-width: 200px;
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* Toast status colors */
.toast.bg-green-600 {
  background: linear-gradient(145deg, #059669, #10b981);
  border-left: 4px solid #34d399;
}

.toast.bg-red-600 {
  background: linear-gradient(145deg, #dc2626, #ef4444);
  border-left: 4px solid #f87171;
}

/* Customer row animation */
.customer-row {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* For modern browsers that support focus-visible */
*:focus-visible {
  outline: 2px solid rgb(99, 102, 241);
  outline-offset: 2px;
}

/* Fix for double toast class condition */
.bg-green-600.bg-green-600 {
  background-color: rgb(22, 163, 74);
}

.bg-red-600.bg-red-600 {
  background-color: rgb(220, 38, 38);
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .bg-gray-100 {
    background-color: #e42222;
  }

  .bg-white {
    background-color: #f5eeee;
  }

  .bg-gray-50 {
    background-color: #fafafa;
  }

  .text-gray-800,
  .text-gray-900 {
    color: #121010;
  }

  .text-gray-600,
  .text-gray-500 {
    color: #151313;
  }

  .border-gray-200,
  .border-gray-300 {
    border-color: #404040;
  }

  .shadow-md,
  .shadow-sm {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }

  .hover\:bg-gray-50:hover {
    background-color: #cf8a8a;
  }

  .bg-green-100 {
    background-color: rgba(22, 163, 74, 0.2);
  }

  .bg-red-100 {
    background-color: rgba(220, 38, 38, 0.2);
  }

  .border-green-300 {
    border-color: rgba(22, 163, 74, 0.4);
  }

  .border-red-300 {
    border-color: rgba(220, 38, 38, 0.4);
  }
}

/* Add these styles to your existing <style> section */
.pagination-button {
  @apply px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150;
}

.pagination-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.pagination-button:not(:disabled):hover {
  @apply bg-gray-50;
}

.pagination-active {
  @apply bg-indigo-600 text-white;
}

.pagination-inactive {
  @apply bg-white text-gray-700 hover:bg-gray-50 border;
}
</style>