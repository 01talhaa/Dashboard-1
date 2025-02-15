<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-2/5 sm:w-64 bg-slate-800 text-white transition-all duration-300 flex-shrink-0 overflow-auto">
      <div class="p-3 sm:p-5">
        <div class="flex items-center gap-2 text-sm sm:text-xl font-bold">
          <div class="w-6 sm:w-8 h-6 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 sm:h-5 w-4 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span class="ml-2">{{ shop.name ? shop.name + "'s" : 'ACTIVE' }}<span class="text-red-500">Platform</span></span>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="px-3 sm:px-5 mt-2 sm:mt-6">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input v-model="searchQuery" type="search" placeholder="Search menu..."
            class="w-full pl-8 pr-3 py-2 bg-slate-700 rounded-md text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      <!-- Menu Items -->
      <nav class="mt-4 sm:mt-6">
        <template v-for="(item, index) in filteredMenuItems" :key="index">
          <router-link :to="item.path"
            class="flex items-center px-3 sm:px-5 py-2 sm:py-3 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 rounded-md mx-2 mb-1">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="ml-3 text-sm font-medium">{{ item.name }}</span>
          </router-link>
        </template>
      </nav>

      <div class="absolute bottom-0 w-full pb-5 px-3 sm:px-5">
        <router-link to="/" class="flex items-center text-red-400 hover:text-red-300 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-sm font-medium">Logout</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b shadow-sm sticky top-0 z-10">
        <div class="flex items-center justify-between px-6 py-3">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold text-gray-800">Customer Management</h2>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/manageShop" class="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 shadow-sm hover:border-red-500 transition-all duration-200">
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
              <h1 class="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Customer Details</h1>
              <button @click="fetchCustomers" 
                class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-600">Manage your customer information and payment status</p>
          </div>

          <!-- Table Section -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div v-if="loading" class="p-8 text-center">
              <svg class="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="mt-2 text-gray-600">Loading customer data...</p>
            </div>
            <div v-else-if="error" class="p-8 text-center">
              <svg class="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-red-600 font-medium">{{ error }}</p>
              <button @click="fetchCustomers" class="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700">
                Try Again
              </button>
            </div>
            <div v-else-if="!customers.length" class="p-8 text-center">
              <svg class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p class="text-gray-600 font-medium">No customer data available</p>
              <button @click="fetchCustomers" class="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700">
                Refresh Data
              </button>
            </div>
            <template v-else>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th class="px-6 py-3">ID</th>
                      <th class="px-6 py-3">Phone</th>
                      <th class="px-6 py-3">Amount</th>
                      <th class="px-6 py-3">Status</th>
                      <th class="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="customer in customers" :key="customer.id" 
                      class="hover:bg-gray-50 transition-colors duration-150 customer-row">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ customer.id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.phone }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${{ formatBalance(customer.balance) }}
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
                        <select 
                          v-model="customer.status" 
                          @change="updateStatus(customer)"
                          class="px-3 py-1.5 text-sm rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value="due">Due</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
        </div>
      </main>
      
      <!-- Toast Notification -->
      <transition name="toast">
        <div v-if="showToast" 
          class="fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center toast" 
          :class="toastClass">
          <span v-if="toastStatus === 'success' || toastStatus === 'paid'" class="mr-2">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </span>
          <span v-else-if="toastStatus === 'error' || toastStatus === 'due'" class="mr-2">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
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

// State
const shop = ref({ logo: null, name: null });
const searchQuery = ref("");
const customers = ref([]);
const loading = ref(false);
const error = ref(null);
const debugInfo = ref(null);
const showToast = ref(false);
const toastMessage = ref('');
const toastStatus = ref('');

// API token
const apiToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBleGRyaXZlMzY1LmNvbS9hcGkvYXV0aC9sb2dpbiIsImlhdCI6MTczOTU2OTgxNiwiZXhwIjoxNzM5NzQyNjE2LCJuYmYiOjE3Mzk1Njk4MTYsImp0aSI6IktZUFlZT2VlY0lRMzRDYnciLCJzdWIiOiIxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyIsImVtYWlsIjoiYWRtaW5AZGVtby5jb20iLCJuYW1lIjoiQWRtaW4iLCJyb2xlIjpbImFkbWluIl19.5emS3KY69tO3JzWDCk5c7F89JvtSLgXOxIR9WtYkvIw';

// Menu configuration
const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard", active: true },
  { name: "Products", path: "/products", icon: "Package" },
  { name: "Orders", path: "/orders", icon: "ShoppingCart" },
  { name: "Customers", path: "/customers", icon: "Package" },
  { name: "Reports", path: "/reports", icon: "BarChart" },
  { name: "Manage Shop", path: "/manageShop", icon: "BarChart" },
  { name: "Cupon", path: "/cupon", icon: "BarChart" },
  { name: "Invoicing", path: "/invoicing", icon: "BarChart" },
  { name: "Lucky Spin", path: "/luckyspin", icon: "BarChart" },
  { name: "Billing", path: "/billing", icon: "BarChart" },
];

// Computed
const filteredMenuItems = computed(() => {
  return menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Toast class computation
const toastClass = computed(() => ({
  'bg-green-600': toastStatus.value === 'success',
  'bg-red-600': toastStatus.value === 'error',
  'bg-green-600': toastStatus.value === 'paid',
  'bg-red-600': toastStatus.value === 'due'
}));

// Methods
const fetchCustomers = async () => {
  loading.value = true;
  error.value = null;
  debugInfo.value = null;
  
  try {
    // Log request details
    debugInfo.value = {
      url: 'https://apexdrive365.com/api/users',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      }
    };

    const response = await fetch('https://apexdrive365.com/api/users', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      }
    });

    debugInfo.value = {
      ...debugInfo.value,
      status: response.status,
      statusText: response.statusText
    };

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    debugInfo.value = {
      ...debugInfo.value,
      responseData: data
    };

    if (data.success && data.data && data.data.result) {
      // Set initial status for customers based on balance
      customers.value = data.data.result.map(customer => ({
        ...customer,
        status: customer.status || (parseFloat(customer.balance) > 0 ? 'due' : 'paid')
      }));
      console.log('Customers loaded:', customers.value);
      showToastMessage('Customer data loaded successfully', 'success');
    } else {
      throw new Error('Invalid data structure received from API');
    }
  } catch (err) {
    error.value = `Failed to fetch customers: ${err.message}`;
    console.error('Error:', err);
    showToastMessage(`Failed to fetch customers: ${err.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

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
const updateStatus = (customer) => {
  // Simply show the toast with the new status
  showToastMessage(`Status updated to ${customer.status}`, customer.status);
  
  // In a real application, this is where we would call the API
  console.log(`Status updated (client-side only): User ${customer.id} is now ${customer.status}`);
  
  // If we had local storage persistence, we could save it here
  try {
    // Get existing saved statuses or initialize empty object
    const savedStatuses = JSON.parse(localStorage.getItem('customerStatuses') || '{}');
    
    // Update this customer's status
    savedStatuses[customer.id] = customer.status;
    
    // Save back to localStorage
    localStorage.setItem('customerStatuses', JSON.stringify(savedStatuses));
  } catch (e) {
    console.error('Could not save status to localStorage:', e);
  }
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
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
  
  .text-gray-800, .text-gray-900 {
    color: #121010;
  }
  
  .text-gray-600, .text-gray-500 {
    color: #151313;
  }
  
  .border-gray-200, .border-gray-300 {
    border-color: #404040;
  }
  
  .shadow-md, .shadow-sm {
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
</style>