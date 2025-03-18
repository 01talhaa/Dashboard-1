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
            <h1 class="text-xl font-semibold text-gray-800">Transaction ID Generator</h1>
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
          <!-- Generator Section -->
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex flex-wrap gap-4">
              <div class="flex-1 min-w-[200px]">
                <input v-model="numberOfIds" type="number" min="1" max="100"
                  placeholder="Enter number of IDs to generate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
              </div>
              <button @click="generateIds"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                Generate IDs
              </button>
              <!-- Add Delete All button -->
              <button @click="confirmDeleteAll"
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                :disabled="!generatedIds.length || loading">
                Delete All
              </button>
              <div class="relative inline-block">
                <button @click="showDownloadOptions = !showDownloadOptions"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2">
                  Download
                </button>
                <!-- Download Options Dropdown -->
                <div v-if="showDownloadOptions" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <div class="py-1">
                    <button @click="downloadCurrentPageIds('csv')" class="w-full px-4 py-2 text-left hover:bg-gray-100">
                      Download as CSV
                    </button>
                    <button @click="downloadCurrentPageIds('pdf')" class="w-full px-4 py-2 text-left hover:bg-gray-100">
                      Download as PDF
                    </button>
                    <button @click="downloadCurrentPageIds('txt')" class="w-full px-4 py-2 text-left hover:bg-gray-100">
                      Download as TXT
                    </button>
                    <button @click="downloadCurrentPageIds('json')"
                      class="w-full px-4 py-2 text-left hover:bg-gray-100">
                      Download as JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Search and Table Section -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <!-- Search Bar -->
            <div class="mb-6">
              <div class="relative">
                <input v-model="searchQuery" type="text" placeholder="Search transaction IDs..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
              </div>
            </div>

            <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {{ error }}
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <div v-if="loading" class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <table v-else class="w-full">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(id, index) in paginatedAndFilteredIds" :key="id.transactionId" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ id.transactionId }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ id.date }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button @click="deleteId(id.transactionId)"
                        class="text-red-600 hover:text-red-800 transition-colors duration-200">
                        <span class="material-icons text-xl">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Add this just above the pagination section -->
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">Show entries:</label>
                <select v-model="itemsPerPage"
                  class="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @change="handleItemsPerPageChange">
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>

            <!-- Updated Pagination -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div class="text-sm text-gray-700">
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} entries
              </div>

              <div class="inline-flex items-center gap-2">
                <button @click="currentPage = 1" :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  First
                </button>

                <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  <span class="text-sm">&lt;</span>
                </button>

                <div class="flex gap-1">
                  <template v-for="page in displayedPages" :key="page">
                    <button v-if="page !== '...'" @click="currentPage = page" :class="[
                      'px-3 py-1 rounded border min-w-[32px]',
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    ]">
                      {{ page }}
                    </button>
                    <span v-else class="px-2 py-1 text-gray-500">{{ page }}</span>
                  </template>
                </div>

                <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  <span class="text-sm">&gt;</span>
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

  <!-- Add confirmation modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">Confirm Delete All</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to delete all transaction IDs? This action cannot be undone.
      </p>
      <div class="flex justify-end gap-4">
        <button @click="showDeleteModal = false"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button @click="deleteAllIds"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import Sidebar from "./Sidebar.vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from 'axios';

// Shop and menu items data
const shop = ref({
  name: "",
  logo: "",
});

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
    name: "Transaction ID", 
    path: "/transaction-id", 
    icon: "DollarSign",
    subMenu: [
      { name: "User Transactions", path: "/user-transactions", icon: "FileText" }
    ]
  },
];


const numberOfIds = ref("");
const generatedIds = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10); // Match API default limit
const showDownloadOptions = ref(false);
const loading = ref(false);
const error = ref(null);
const totalItems = ref(0);
const totalPages = ref(1);
const showDeleteModal = ref(false);

// Add these debug logs in your mounted hook
onMounted(async () => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }

  console.log('Initial fetch...');
  await fetchTransactions();
  console.log('After fetch:', {
    items: generatedIds.value.length,
    page: currentPage.value,
    total: totalItems.value,
    totalPages: totalPages.value
  });

  document.addEventListener('click', closeDropdown);
});

// Pagination display logic
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2; // Number of pages to show on each side of current page

  let pages = [];

  if (total <= 7) {
    // If total pages is 7 or less, show all pages
    pages = Array.from({ length: total }, (_, i) => i + 1);
  } else {
    // Always include first page
    pages.push(1);

    if (current > delta + 2) {
      // Add ellipsis after first page
      pages.push('...');
    }

    // Calculate range around current page
    const rangeStart = Math.max(2, current - delta);
    const rangeEnd = Math.min(total - 1, current + delta);

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (current < total - (delta + 1)) {
      // Add ellipsis before last page
      pages.push('...');
    }

    // Always include last page
    if (total > 1) {
      pages.push(total);
    }
  }

  return pages;
});

// Save IDs to localStorage whenever they change
watch(generatedIds, (newIds) => {
  localStorage.setItem("transactionIds", JSON.stringify(newIds));
}, { deep: true });

// Generate random transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `TRX-${timestamp.substr(-6)}-${random}`;
};

// Generate IDs based on user input
const generateIds = async () => {
  const num = parseInt(numberOfIds.value);
  if (num > 0 && num <= 1000) {
    try {
      loading.value = true;
      const newIds = Array(num).fill(null).map(() => ({
        transactionId: generateTransactionId(),
        date: new Date().toISOString().split('T')[0]
      }));

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/transactions`, {
        transactions: newIds
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        await fetchTransactions();
        numberOfIds.value = "";
        error.value = null;
      }
    } catch (err) {
      error.value = 'Failed to generate transactions';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
};

// Add fetchTransactions function
const fetchTransactions = async (page = currentPage.value) => {
  try {
    loading.value = true;
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions`, {
      params: {
        page,
        limit: itemsPerPage.value
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.data.success) {
      const { meta, result } = response.data.data;
      generatedIds.value = result || []; // Add null check
      totalItems.value = meta.total;
      totalPages.value = meta.totalPage;
      currentPage.value = parseInt(meta.page);
      console.log('Fetched data:', {
        items: result.length,
        page: meta.page,
        total: meta.total,
        totalPages: meta.totalPage
      });
    }
  } catch (err) {
    error.value = 'Failed to fetch transactions';
    console.error('Fetch error:', err);
    generatedIds.value = []; // Reset on error
  } finally {
    loading.value = false;
  }
};

// Delete a specific ID
const deleteId = async (transactionId) => {
  try {
    loading.value = true;
    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/transactions/all-delete`, {
      data: {
        transactionIds: [transactionId]
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.data.success) {
      await fetchTransactions();
    }
  } catch (err) {
    error.value = 'Failed to delete transaction';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Confirm delete all IDs
const confirmDeleteAll = () => {
  showDeleteModal.value = true;
};

// Delete all IDs
const deleteAllIds = async () => {
  try {
    loading.value = true;
    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/transactions/all-delete`, {
      data: {
        transactionIds: generatedIds.value.map(id => id.transactionId)
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.data.success) {
      await fetchTransactions();
      error.value = null;
    }
  } catch (err) {
    error.value = 'Failed to delete all transactions';
    console.error(err);
  } finally {
    loading.value = false;
    showDeleteModal.value = false;
  }
};

// Download functions remain the same
const downloadCurrentPageIds = (format) => {
  const currentPageIds = paginatedAndFilteredIds.value;
  const fileName = `transaction-ids-page-${currentPage.value}`;

  switch (format) {
    case 'csv':
      downloadCSV(currentPageIds, fileName);
      break;
    case 'pdf':
      downloadPDF(currentPageIds, fileName);
      break;
    case 'txt':
      downloadTXT(currentPageIds, fileName);
      break;
    case 'json':
      downloadJSON(currentPageIds, fileName);
      break;
  }

  showDownloadOptions.value = false;
};

const downloadCSV = (data, fileName) => {
  const headers = ["No.", "Transaction ID", "Generated Date"];
  const csvContent = [
    headers,
    ...data.map((id, index) => [
      (currentPage.value - 1) * itemsPerPage.value + index + 1,
      id.transactionId,
      id.date
    ])
  ]
    .map(row => row.join(","))
    .join("\n");

  downloadFile(csvContent, `${fileName}.csv`, "text/csv");
};

const downloadPDF = (data, fileName) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Transaction IDs Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`Page ${currentPage.value} - Generated on ${new Date().toLocaleString()}`, 14, 25);

  doc.autoTable({
    head: [["No.", "Transaction ID", "Generated Date"]],
    body: data.map((id, index) => [
      (currentPage.value - 1) * itemsPerPage.value + index + 1,
      id.transactionId,
      id.date
    ]),
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 100 },
      2: { cellWidth: 70 }
    }
  });

  doc.save(`${fileName}.pdf`);
};

const downloadTXT = (data, fileName) => {
  const txtContent = data.map((id, index) =>
    `${(currentPage.value - 1) * itemsPerPage.value + index + 1}. ${id.transactionId} - Generated on: ${id.date}`
  ).join("\n");

  downloadFile(txtContent, `${fileName}.txt`, "text/plain");
};

const downloadJSON = (data, fileName) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${fileName}.json`, "application/json");
};

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Filter IDs based on search query
const filteredIds = computed(() => {
  if (!searchQuery.value) return generatedIds.value;
  return generatedIds.value.filter(id =>
    id.transactionId.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Pagination computations
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => {
  const end = startIndex.value + itemsPerPage.value;
  return Math.min(end, totalItems.value);
});

const paginatedAndFilteredIds = computed(() => {
  return generatedIds.value;
});

// Watch for search query changes to reset pagination
watch(searchQuery, async (newQuery) => {
  currentPage.value = 1;
  try {
    loading.value = true;
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions`, {
      params: {
        page: 1,
        limit: itemsPerPage.value,
        search: newQuery
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.data.success) {
      const { meta, result } = response.data.data;
      generatedIds.value = result || [];
      totalItems.value = meta.total;
      totalPages.value = meta.totalPage;
    }
  } catch (err) {
    error.value = 'Failed to search transactions';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Close dropdown when clicking outside
const closeDropdown = (e) => {
  if (!e.target.closest('.relative')) {
    showDownloadOptions.value = false;
  }
};

// Cleanup event listeners on component unmount
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

// Add pagination watcher
watch([currentPage, itemsPerPage], async ([newPage, newLimit], [oldPage, oldLimit]) => {
  if (newPage !== oldPage || newLimit !== oldLimit) {
    await fetchTransactions(newPage);
  }
}, { immediate: true });

// Add handleItemsPerPageChange function
const handleItemsPerPageChange = async () => {
  currentPage.value = 1; // Reset to first page
  await fetchTransactions(1);
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive container padding */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Add smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Add hover effects */
.hover\:bg-gray-50:hover {
  background-color: rgb(249, 250, 251);
}

/* Add focus styles */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

/* Add dropdown styles */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Table styles */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  white-space: normal;
  word-wrap: break-word;
  max-width: 300px;
}

/* Pagination styles */
.pagination-button {
  @apply px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50;
}

.pagination-number {
  @apply px-3 py-1 rounded border min-w-[32px] text-center;
}

.pagination-number.active {
  @apply bg-blue-600 text-white border-blue-600;
}

/* PDF styles */
@page {
  margin: 10mm;
}

/* Material Icons alignment */
.material-icons {
  vertical-align: middle;
  line-height: 1;
}
</style>