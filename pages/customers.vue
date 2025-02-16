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
            <div class="mb-6 w-1/2">
              <input type="text" v-model="customerSearchQuery" @input="searchCustomers"
                class="p-2 w-full border rounded-md" placeholder="Type name or phone and press Enter" />
            </div>
            <!-- Create Customer Button -->
            <button @click="openCreateModal" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700">
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
        class="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-md shadow-md w-96">
          <h2 class="text-2xl font-semibold mb-4">{{ editingCustomer ? 'Edit Customer' : 'Create Customer' }}</h2>

          <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input type="text" id="name" v-model="modalCustomer.name"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="phone" class="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
            <input type="text" id="phone" v-model="modalCustomer.phone"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="nid" class="block text-gray-700 text-sm font-bold mb-2">NID:</label>
            <input type="text" id="nid" v-model="modalCustomer.nid"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="address" class="block text-gray-700 text-sm font-bold mb-2">Address:</label>
            <input type="text" id="address" v-model="modalCustomer.address"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="role" class="block text-gray-700 text-sm font-bold mb-2">Role:</label>
            <select id="role" v-model="modalCustomer.role"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="customer">Customer</option>
              <!-- <option value="user">User</option>
              <option value="admin">Admin</option> -->
            </select>
          </div>
          <div class="mb-4">
            <label for="walletBalance" class="block text-gray-700 text-sm font-bold mb-2">Wallet Balance:</label>
            <input type="number" id="walletBalance" v-model="modalCustomer.walletBalance"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>


          <div class="flex justify-end">
            <button @click="closeModal"
              class="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 mr-2">Cancel</button>
            <button @click="saveCustomer"
              class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

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

// API token
const apiToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBleGRyaXZlMzY1LmNvbS9hcGkvYXV0aC9sb2dpbiIsImlhdCI6MTczOTU2OTgxNiwiZXhwIjoxNzM5NzQyNjE2LCJuYmYiOjE3Mzk1Njk4MTYsImp0aSI6IktZUFlZT2VlY0lRMzRDYnciLCJzdWIiOiIxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyIsImVtYWlsIjoiYWRtaW5AZGVtby5jb20iLCJuYW1lIjoiQWRtaW4iLCJyb2xlIjpbImFkbWluIl19.5emS3KY69tO3JzWDCk5c7F89JvtSLgXOxIR9WtYkvIw';

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

// Reactive search query for customers
const customerSearchQuery = ref('');

// Modal state
const showModal = ref(false);
const editingCustomer = ref(null);
const modalCustomer = ref({
  name: '',
  phone: '',
  nid: '',
  address: '',
  walletBalance: 0,
  role: 'customer' // Add default role
});

// Update these refs for pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const lastPage = ref(1);

onMounted(() => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop); // Populate shop data from localStorage
  }

  fetchCustomers(); // Fetch customers when the component is mounted
});

// Fetch customers from API
const fetchCustomers = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`https://apexdrive365.com/api/users?page=${page}&limit=${itemsPerPage.value}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
      }
    });

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

// Filter customers based on search query
const filteredCustomers = computed(() => {
  if (!customerSearchQuery.value) return customers.value

  const searchTerm = customerSearchQuery.value.toLowerCase();
  return customers.value.filter(customer => {
    const name = customer.name ? customer.name.toLowerCase() : '';
    const phone = customer.phone ? customer.phone.toLowerCase() : '';
    return name.includes(searchTerm) || phone.includes(searchTerm);
  });
});

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
  if (currentPage.value < lastPage.value) {
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
    role: 'customer'
  };
  showModal.value = true;
};


const openEditModal = (customer) => {
  editingCustomer.value = customer;
  modalCustomer.value = {
    name: customer.name || '',
    phone: customer.phone || '', // Don't modify the phone number on load
    nid: customer.nid || '',
    address: customer.address || '',
    walletBalance: customer.balance || 0,
    role: customer.role || 'customer'
  };
  showModal.value = true;
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

    if (!editingCustomer.value) {
      // Only add password fields for new users
      requestBody.password = '12345678';
      requestBody.password_confirmation = '12345678';
    }

    const response = await fetch(apiUrl, {
      method: editingCustomer.value ? 'PATCH' : 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

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
</style>