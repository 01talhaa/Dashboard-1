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
                <input
                  v-model="numberOfIds"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter number of IDs to generate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                @click="generateIds"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                Generate IDs
              </button>
              <div class="relative inline-block">
                <button
                  @click="showDownloadOptions = !showDownloadOptions"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                >
                  Download
                </button>
                <!-- Download Options Dropdown -->
                <div v-if="showDownloadOptions" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <div class="py-1">
                    <button
                      @click="downloadCurrentPageIds('csv')"
                      class="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Download as CSV
                    </button>
                    <button
                      @click="downloadCurrentPageIds('pdf')"
                      class="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Download as PDF
                    </button>
                    <button
                      @click="downloadCurrentPageIds('txt')"
                      class="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Download as TXT
                    </button>
                    <button
                      @click="downloadCurrentPageIds('json')"
                      class="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
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
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search transaction IDs..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
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
                      <button
                        @click="deleteId(id.transactionId)"
                        class="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <span class="material-icons text-xl">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Updated Pagination -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div class="text-sm text-gray-700">
                Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredIds.length) }} of {{ filteredIds.length }} entries
              </div>
              <div class="inline-flex items-center gap-2">
                <button
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  First
                </button>
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <span class="text-sm"><-left</span>
                </button>
                
                <!-- Page Numbers -->
                <div class="flex gap-1">
                  <template v-for="page in displayedPages" :key="page">
                    <button
                      v-if="page !== '...'"
                      @click="currentPage = page"
                      :class="[
                        'px-3 py-1 rounded border min-w-[32px]',
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      ]"
                    >
                      {{ page }}
                    </button>
                    <span 
                      v-else 
                      class="px-2 py-1 text-gray-500"
                    >
                      {{ page }}
                    </span>
                  </template>
                </div>

                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-center"
                >
                  <span class="text-sm ">right-></span>
                </button>
                <button
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
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
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import Sidebar from "./Sidebar.vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Shop and menu items data
const shop = ref({
  name: "",
  logo: "",
});

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  { name: "Products", path: "/products", icon: "Package" },
  { name: "Orders", path: "/orders", icon: "ShoppingCart" },
  { name: "Customers", path: "/customers", icon: "Package" },
  { name: "Reports", path: "/reports", icon: "BarChart" },
  { name: "Manage Shop", path: "/manageShop", icon: "BarChart" },
  { name: "Cupon", path: "/cupon", icon: "BarChart" },
  { name: "Invoicing", path: "/invoicing", icon: "BarChart" },
  { name: "Lucky Spin", path: "/luckyspin", icon: "BarChart" },
  { name: "Billing", path: "/billing", icon: "BarChart" },
  { name: "Transaction ID", path: "/transaction-id", icon: "BarChart" },
];

const numberOfIds = ref("");
const generatedIds = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 50;
const showDownloadOptions = ref(false);

// Load IDs from localStorage on component mount
onMounted(() => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }
  
  const savedIds = localStorage.getItem("transactionIds");
  if (savedIds) {
    generatedIds.value = JSON.parse(savedIds);
  }

  // Close dropdown when clicking outside
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
const generateIds = () => {
  const num = parseInt(numberOfIds.value);
  if (num > 0 && num <= 1000) {
    const newIds = Array(num).fill(null).map(() => ({
      transactionId: generateTransactionId(),
      date: new Date().toLocaleString(),
    }));
    generatedIds.value = [...newIds, ...generatedIds.value];
    numberOfIds.value = "";
  }
};

// Delete a specific ID
const deleteId = (transactionId) => {
  generatedIds.value = generatedIds.value.filter(id => id.transactionId !== transactionId);
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
      (currentPage.value - 1) * itemsPerPage + index + 1,
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
      (currentPage.value - 1) * itemsPerPage + index + 1,
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
    `${(currentPage.value - 1) * itemsPerPage + index + 1}. ${id.transactionId} - Generated on: ${id.date}`
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
  return generatedIds.value.filter(id =>
    id.transactionId.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Pagination computations
const totalPages = computed(() => Math.ceil(filteredIds.value.length / itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => startIndex.value + itemsPerPage);

const paginatedAndFilteredIds = computed(() => {
  return filteredIds.value.slice(startIndex.value, endIndex.value);
});

// Watch for search query changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1;
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