<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-2/5 sm:w-64 bg-gray-900 text-white transition-all duration-300 flex-shrink-0 overflow-auto">
      <div class="p-2 sm:p-4">
        <div class="flex items-center gap-2 text-sm sm:text-xl font-bold">
          <div class="w-6 sm:w-8 h-6 sm:h-8 bg-red-500 rounded-lg"></div>
          <span class="ml-3">{{ shop.name ? shop.name + "'s" : 'ACTIVE' }}<span
              class="text-red-500">Platform</span></span>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="px-2 sm:px-4 mt-2 sm:mt-6">
        <input v-model="searchQuery" type="search" placeholder="Search"
          class="w-full px-2 sm:px-4 py-1 sm:py-2 bg-gray-800 rounded-md text-xs sm:text-sm" />
      </div>

      <!-- Menu Items -->
      <nav class="mt-3 sm:mt-6">
        <template v-for="(item, index) in filteredMenuItems" :key="index">
          <router-link :to="item.path"
            class="flex items-center px-2 sm:px-4 py-2 sm:py-3 text-gray-300 hover:bg-gray-800">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="ml-3">{{ item.name }}</span>
          </router-link>
        </template>
      </nav>
      <router-link to="/" class=" mx-7 py-80  text-red-500    text-left block">
        Logout
      </router-link>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto transition-all duration-300">
      <!-- Header (Sticky at Top, Outside of Main) -->
      <header class="bg-white border-b sticky top-0 z-10">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center space-x-4">
            <!-- Add content if necessary -->
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/manageShop" class="w-9 h-9 rounded-full overflow-hidden cursor-pointer">
              <img v-if="shop.logo" :src="shop.logo" alt="Shop Logo" class="w-full h-full object-cover" />
              <img v-else src="/avatar-placeholder.png" alt="Default Logo" class="w-full h-full object-cover" />
            </router-link>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="p-4 mt-0.5">

        <div class="container mx-auto p-6">
          <h1 class="text-3xl font-semibold mb-6">Customers - Active eCommerce CMS</h1>

          <div class="flex justify-between items-center mb-4">
            <!-- Search Bar -->
            <div class="mb-6 flex space-x-4">
              <div class="w-32">
                <select v-model="searchColumn" class="w-full p-2 border rounded-md">
                  <option value="name">Name</option>
                  <option value="phone">Phone</option>
                  <option value="nid">NID</option>
                  <!-- <option value="address">Address</option> -->
                </select>
              </div>

              <div class="flex-1 flex space-x-2">
                <div class="relative flex-1">
                  <input type="text" v-model="customerSearchQuery" @keyup.enter="performSearch"
                    class="w-full p-2 border rounded-md pr-10" :placeholder="`Search by ${searchColumn}...`">
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg v-if="loading" class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg"
                      fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                  </div>
                </div>

                <button @click="performSearch"
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  :disabled="loading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>

                <button @click="clearSearch"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  :disabled="loading">
                  Clear
                </button>
              </div>
            </div>
            <!-- Create Customer Button -->
            <button @click="openCreateModal"
              class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create Customer
            </button>
          </div>


          <!-- Customer Table -->
          <div class="overflow-x-auto bg-white rounded-lg shadow-md" v-if="!loading && !error && customers.length > 0">
            <table class="min-w-full table-auto">
              <thead>
                <tr class="bg-gray-100 text-left">
                  <th class="px-4 py-2">Name</th>
                  <th class="px-4 py-2">Phone</th>
                  <th class="px-4 py-2">NID</th>
                  <th class="px-4 py-2">Address</th>
                  <th class="px-4 py-2">Wallet Balance</th>
                  <th class="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in paginatedCustomers" :key="customer.id"
                  :class="{ 'bg-red-100': customer.status === 'blocked', 'bg-yellow-100': customer.status === 'suspicious' }">
                  <td class="px-4 py-2">{{ customer.name }}</td>
                  <td class="px-4 py-2">{{ customer.phone }}</td>
                  <td class="px-4 py-2">{{ customer.nid }}</td>
                  <td class="px-4 py-2">{{ customer.address }}</td>
                  <td class="px-4 py-2">{{ (customer.balance) }}</td>
                  <td class="px-4 py-2">
                    <button @click="openEditModal(customer)" class="text-blue-500 hover:text-blue-700">
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="text-center p-6">
            Loading customers...
          </div>

          <!-- Error state -->
          <div v-if="error" class="text-red-500 text-center p-6">
            Error: {{ error }}
          </div>

          <!-- Empty state -->
          <div v-if="!loading && !error && customers.length === 0" class="text-gray-500 text-center p-6">
            No customers found.
          </div>

          <!-- Pagination -->
          <div class="mt-4 flex justify-center items-center space-x-4"
            v-if="!loading && !error && customers.length > 0">
            <button @click="previousPage" :disabled="currentPage <= 1"
              class="px-4 py-2 border rounded-md text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50">
              Previous
            </button>

            <div class="flex items-center space-x-2">
              <span class="mx-2">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <span class="text-gray-500">
                (Total items: {{ totalItems }})
              </span>
            </div>

            <button @click="nextPage" :disabled="currentPage >= totalPages"
              class="px-4 py-2 border rounded-md text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50">
              Next
            </button>

            <!-- Optional: Add items per page selector -->
            <select v-model="itemsPerPage" class="ml-4 px-2 py-1 border rounded-md">
              <option :value="10">10 per page</option>
              <option :value="20">20 per page</option>
              <option :value="50">50 per page</option>
            </select>
          </div>
        </div>

      </main>

      <!-- Create/Edit Customer Modal -->
      <div v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
          <!-- Modal Header -->
          <div
            class="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <h2 class="text-2xl font-bold">
              {{ editingCustomer ? 'Edit Customer' : 'Create New Customer' }}
            </h2>
            <button @click="closeModal" class="text-white hover:text-red-200 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name Field -->
              <div class="form-group">
                <label for="name" class="label-style">Name<span class="text-red-500">*</span></label>
                <input type="text" id="name" v-model="modalCustomer.name" class="input-style"
                  :class="{ 'border-red-500': formErrors.name }" placeholder="Enter customer name">
              </div>

              <!-- Phone Field -->
              <div class="form-group">
                <label for="phone" class="label-style">Phone<span class="text-red-500">*</span></label>
                <input type="text" id="phone" v-model="modalCustomer.phone" class="input-style"
                  :class="{ 'border-red-500': formErrors.phone }" placeholder="Enter phone number">
              </div>

              <!-- NID Field -->
              <div class="form-group">
                <label for="nid" class="label-style">NID</label>
                <input type="text" id="nid" v-model="modalCustomer.nid" class="input-style"
                  placeholder="Enter NID number">
              </div>

              <!-- Address Field -->
              <div class="form-group">
                <label for="address" class="label-style">Address</label>
                <input type="text" id="address" v-model="modalCustomer.address" class="input-style"
                  placeholder="Enter address">
              </div>

              <!-- Role Field -->
              <div class="form-group">
                <label for="role" class="label-style">Role</label>
                <select id="role" v-model="modalCustomer.role" class="select-style">
                  <option value="customer">Customer</option>
                </select>
              </div>

              <!-- Wallet Balance Field -->
              <div class="form-group">
                <label for="walletBalance" class="label-style">Wallet Balance</label>
                <input type="number" id="walletBalance" v-model="modalCustomer.walletBalance" class="input-style"
                  placeholder="Enter initial balance">
              </div>

              <!-- Password Fields (for all customers) -->
              <div class="col-span-2 mb-4">
                <label class="inline-flex items-center">
                  <input type="checkbox" v-model="modalCustomer.change_password"
                    class="form-checkbox h-5 w-5 text-blue-600">
                  <span class="ml-2 text-gray-700">
                    {{ editingCustomer ? 'Change Password' : 'Set Password' }}
                  </span>
                </label>
              </div>

              <template v-if="!editingCustomer || modalCustomer.change_password">
                <div class="form-group">
                  <label for="password" class="label-style">
                    Password<span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input :type="showPassword ? 'text' : 'password'" id="password" v-model="modalCustomer.password"
                      class="input-style pr-10" :class="{ 'border-red-500': formErrors.password }"
                      placeholder="Enter password">
                    <button @click="showPassword = !showPassword"
                      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      type="button">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="password_confirmation" class="label-style">
                    Confirm Password<span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input :type="showPassword ? 'text' : 'password'" id="password_confirmation"
                      v-model="modalCustomer.password_confirmation" class="input-style pr-10"
                      :class="{ 'border-red-500': formErrors.password_confirmation }" placeholder="Confirm password">
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
            <button @click="closeModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
              Cancel
            </button>
            <button @click="saveCustomer"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ loading ? 'Saving...' : 'Save Customer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash'; // Import debounce function

// Menu items definition
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

// Add token handling function
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// Reactive search query for menu items
const searchQuery = ref("");
const filteredMenuItems = computed(() => {
  return menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const shop = ref({
  name: "",
  logo: "",
  // Add other properties here as needed
});

// Customers data from API
const customers = ref([]);
const loading = ref(false);
const error = ref(null);

// Update these refs
const customerSearchQuery = ref('');
const searchColumn = ref('name'); // Default search column

// Debounce the search function
const debouncedSearch = debounce(async () => {
  await performSearch();
}, 300); // Adjust the debounce delay as needed (in milliseconds)

// Modal state
const showModal = ref(false);
const editingCustomer = ref(null);
const modalCustomer = ref({
  name: '',
  phone: '',
  nid: '',
  address: '',
  walletBalance: 0,
  role: 'customer',
  password: '',
  password_confirmation: '',
  change_password: false // New flag to control password change
});

// Add these to your existing refs
const showPassword = ref(false);
const formErrors = ref({});

// Update these refs for pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const lastPage = ref(1);

onMounted(() => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }

  fetchCustomers();
});

// Fetch customers from API
const fetchCustomers = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const token = getToken();
    const response = await fetch(`https://apexdrive365.com/api/users?page=${page}&limit=${itemsPerPage.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to login
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data) {
      customers.value = data.data.result;
      totalItems.value = data.data.meta.total;
      lastPage.value = Math.ceil(data.data.meta.total / itemsPerPage.value);
      currentPage.value = parseInt(data.data.meta.page);

      // Debug log
      console.log('Pagination Info:', {
        currentPage: currentPage.value,
        totalPages: lastPage.value,
        totalItems: totalItems.value,
        itemsPerPage: itemsPerPage.value
      });
    } else {
      throw new Error('Failed to fetch customers');
    }
  } catch (e) {
    error.value = e.message;
    console.error("Error fetching customers:", e);
  } finally {
    loading.value = false;
  }
};

// Pagination functionality
const totalPages = computed(() => lastPage.value);

const paginatedCustomers = computed(() => customers.value);

const previousPage = async () => {
  if (currentPage.value > 1) {
    console.log('Moving to previous page:', currentPage.value - 1);
    await fetchCustomers(currentPage.value - 1);
  }
};

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    console.log('Moving to next page:', currentPage.value + 1);
    await fetchCustomers(currentPage.value + 1);
  }
};

// Add a watcher for itemsPerPage changes
watch(itemsPerPage, async (newValue) => {
  console.log('Items per page changed to:', newValue);
  await fetchCustomers(1); // Reset to first page when changing items per page
});

// Update the openCreateModal function
const openCreateModal = () => {
  editingCustomer.value = null;
  modalCustomer.value = {
    name: '',
    phone: '',
    nid: '',
    address: '',
    walletBalance: 0,
    role: 'customer',
    password: '',
    password_confirmation: ''
  };
  showModal.value = true;
};


const openEditModal = (customer) => {
  editingCustomer.value = customer;
  modalCustomer.value = {
    name: customer.name || '',
    phone: customer.phone || '',
    nid: customer.nid || '',
    address: customer.address || '',
    walletBalance: customer.balance || 0,
    role: customer.role || 'customer',
    password: '',
    password_confirmation: '',
    change_password: false
  };
  showModal.value = true;
  showPassword.value = false;
  formErrors.value = {};
};

const closeModal = () => {
  showModal.value = false;
  editingCustomer.value = null;
  modalCustomer.value = {
    name: '',
    phone: '',
    nid: '',
    address: '',
    walletBalance: 0,
    role: 'customer'
  };
};


// Update the saveCustomer function
const saveCustomer = async () => {
  loading.value = true;
  try {
    const token = getToken();
    const apiUrl = editingCustomer.value
      ? `https://apexdrive365.com/api/users/${editingCustomer.value.id}`
      : 'https://apexdrive365.com/api/users';

    let formattedPhone = modalCustomer.value.phone || '';
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const requestBody = {
      name: modalCustomer.value.name?.trim() || '',
      phone: formattedPhone,
      nid: modalCustomer.value.nid?.trim() || '',
      address: modalCustomer.value.address?.trim() || '',
      balance: modalCustomer.value.walletBalance?.toString() || '0',
      role: modalCustomer.value.role || 'customer'
    };

    // Add password fields if it's a new user or password change is requested
    if (!editingCustomer.value || modalCustomer.value.change_password) {
      requestBody.password = modalCustomer.value.password;
      requestBody.password_confirmation = modalCustomer.value.password_confirmation;
    }

    const response = await fetch(apiUrl, {
      method: editingCustomer.value ? 'PATCH' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log

    if (!response.ok) {
      if (response.status === 422) {
        const errorMessage = data.message || Object.values(data.errors || {}).flat().join(', ');
        throw new Error(`Validation error: ${errorMessage}`);
      }

      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      await fetchCustomers();
      closeModal();
      alert('Customer saved successfully');
    } else {
      throw new Error(data.message || 'Failed to save customer');
    }
  } catch (e) {
    error.value = e.message;
    console.error('Error saving customer:', e);
    alert(e.message);
  } finally {
    loading.value = false;
  }
};

// Add these new functions to your script
const performSearch = async () => {
  if (!customerSearchQuery.value.trim()) {
    fetchCustomers();
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const token = getToken();
    const response = await fetch(
      `https://apexdrive365.com/api/users?where=${searchColumn.value},${customerSearchQuery.value.trim()}&page=${currentPage.value}&limit=${itemsPerPage.value}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();
    if (data.success && data.data) {
      customers.value = data.data.result;
      totalItems.value = data.data.meta.total;
      lastPage.value = Math.ceil(data.data.meta.total / itemsPerPage.value);
      currentPage.value = parseInt(data.data.meta.page);

      console.log('Search results:', {
        query: customerSearchQuery.value,
        column: searchColumn.value,
        results: customers.value.length
      });
    }
  } catch (err) {
    error.value = err.message;
    console.error('Search error:', err);
  } finally {
    loading.value = false;
  }
};

const clearSearch = async () => {
  customerSearchQuery.value = '';
  await fetchCustomers(1);
};

// Watch the search query and trigger the debounced search
watch(customerSearchQuery, () => {
  debouncedSearch();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}

input[type="text"],
input[type="number"] {
  padding: 0.5rem;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}

button {
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 1rem;
}

th {
  background-color: #f3f4f6;
}

tr.bg-red-100 {
  background-color: #fee2e2;
}

tr.bg-yellow-100 {
  background-color: #fef9c3;
}

/* Add to your existing <style> section */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

.form-group {
  @apply mb-4;
}

.label-style {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.input-style {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

.select-style {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors;
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-opacity duration-300;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}
</style>