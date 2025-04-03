<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :shop="shop" :menuItems="menuItems" />

    <!-- Main Content -->
    <div class="flex-1 overflow-auto transition-all duration-300">
      <!-- Header -->
      <header class="bg-white border-b sticky top-0 z-10">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center space-x-4"></div>
          <div class="flex items-center space-x-4">
            <!-- Circle for logo image -->
            <div class="flex items-center space-x-4">
              <router-link to="/manageShop" class="w-9 h-9 rounded-full overflow-hidden cursor-pointer">
                <img v-if="shop.logo" :src="shop.logo" alt="Shop Logo" class="w-full h-full object-cover" />
                <img v-else src="/avatar-placeholder.png" alt="Default Logo" class="w-full h-full object-cover" />
              </router-link>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="p-4 mt-0.5">
        <div class="container mx-auto p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <!-- Cards for Total Stats -->
            <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <h3 class="text-4xl font-bold mb-1 overflow-auto">{{ Storestats.Tcustomer }}</h3>
              <p class="text-gray-500 text-sm"><b>Total Customers</b></p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <h3 class="text-4xl font-bold mb-1 overflow-auto">{{ Storestats.Tproduct }}</h3>
              <p class="text-gray-500 text-sm"><b>Total Products</b></p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <h3 class="text-4xl font-bold mb-1 overflow-auto">{{ Storestats.Tbrands }}</h3>
              <p class="text-gray-500 text-sm"><b>Active Cupon</b></p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <h3 class="text-4xl font-bold mb-1 overflow-auto">{{ Storestats.Torder }}</h3>
              <p class="text-gray-500 text-sm"><b>Total Orders</b></p>
            </div>
          </div>

          <!-- Categories and Brands Section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 ">
            <router-link to="/categories" class="bg-white p-6 rounded-lg shadow-sm cursor-pointer">
              <h3 class="font-semibold mb-4">Top Category</h3>
              <div class="space-y-3 overflow-auto">
                <div v-for="category in categories" :key="category.name" class="flex justify-between">
                  <span>{{ category.name }}</span>
                  <span>${{ category.value.toLocaleString() }}</span>
                </div>
              </div>
            </router-link>

            <router-link to="/brands" class="bg-white p-6 rounded-lg shadow-sm cursor-pointer">
              <h3 class="font-semibold mb-4">Top Brands</h3>
              <div class="space-y-3 overflow-auto">
                <div v-for="brand in brands" :key="brand.name" class="flex justify-between">
                  <span>{{ brand.name }}</span>
                  <span>${{ brand.value.toLocaleString() }}</span>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Orders Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link to="orders-stats" class="bg-white p-6 rounded-lg shadow-sm cursor-pointer">
              <h3 class="text-4xl font-bold text-purple-500 mb-2">153</h3>
              <p class="text-gray-500 mb-4">Total Order</p>
              <button class="w-full mt-4 bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600">
                All Orders
              </button>
            </router-link>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div class="col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold mb-4">
                  Sales Distribution for This Month
                </h3>
                <canvas ref="chartCanvas"></canvas>

                <div class="mt-4">
                  <p>
                    <strong>Total Sales for This Month:</strong> ${{ formatNumber(thisMonthTotal) }}
                  </p>
                  <p>
                    <strong>Total Sales for Previous Month:</strong> ${{ formatNumber(previousMonthTotal) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import Sidebar from './Sidebar.vue';  // Import the Sidebar component
import { useStateStore } from '@/stores/useDataStore';

/*
definePageMeta({
  middleware: 'auth'
})
*/

const router = useRouter();

// Initialize state from the store
const Storestats = useStateStore();

const stats = ref([]);
const categories = ref([]);
const brands = ref([]);

// Initialize reactive variables for sales data
const thisMonthSales = ref(0);
const previousMonthSales = ref(0);
const cashOnDelivery = ref(0);
const cashOnStore = ref(0);
const mobilePayment = ref(0);

const loadSalesData = () => {
  try {
    const storedData = localStorage.getItem("salesData");
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("Error parsing salesData from localStorage:", error);
    return null;
  }
};

// On component mount, load and store the data
onMounted(() => {
  const salesData = loadSalesData();

  if (salesData) {
    const thisMonth = salesData.thisMonth || {};
    const previousMonth = salesData.previousMonth || {};

    // Store the sales data in separate variables
    thisMonthSales.value = thisMonth.total || 0;
    previousMonthSales.value = previousMonth.total || 0;

    cashOnDelivery.value = thisMonth.cashOnDelivery || 0;
    cashOnStore.value = thisMonth.cashOnStore || 0;
    mobilePayment.value = thisMonth.mobilePayment || 0;
  }
});

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

// Initialize shop as a reactive object
const shop = ref({ logo: null, name: null });
const shopUrl = ref("");

onMounted(() => {
  // Load shop data from localStorage
  try {
    const savedShop = localStorage.getItem("shopData");
    if (savedShop) {
      shop.value = JSON.parse(savedShop); // Populate shop data from localStorage
    }
  } catch (error) {
    console.error("Error parsing shopData from localStorage:", error);
  }
  shopUrl.value = window.location.origin + "/shop"; // Adjust shop page link
});

// Sales Data
const chartCanvas = ref(null);
const thisMonthTotal = ref(0);
const previousMonthTotal = ref(0);

onMounted(() => {
  const salesData = loadSalesData();

  if (salesData && chartCanvas.value) {
    const thisMonth = salesData.thisMonth || {};
    const previousMonth = salesData.previousMonth || {};

    thisMonthTotal.value = thisMonth.total || 0;
    previousMonthTotal.value = previousMonth.total || 0;

    const chartData = {
      labels: ["Cash on Delivery", "Mobile Payment", "Other"],
      datasets: [
        {
          data: [thisMonth.cashOnDelivery || 0, thisMonth.mobilePayment || 0, thisMonth.cashOnStore || 0],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          hoverBackgroundColor: ["#FF4567", "#3B85D1", "#FFB84F"],
        },
      ],
    };

    new Chart(chartCanvas.value, {
      type: "pie",
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `$${tooltipItem.raw.toLocaleString()}`,
            },
          },
        },
      },
    });
  }
});

const formatNumber = (value) => value.toFixed(2);
</script>

<style scoped>
/* Scoped Styles for Dashboard component */
.container {
  max-width: 1200px;
}
</style>