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
            <router-link to="/manageShop" class="w-9 h-9 rounded-full overflow-hidden cursor-pointer">
              <img v-if="shop.logo" :src="shop.logo" alt="Shop Logo" class="w-full h-full object-cover" />
              <img v-else src="/avatar-placeholder.png" alt="Default Logo" class="w-full h-full object-cover" />
            </router-link>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="p-4 mt-0.5">
        <!-- Search Bar -->
        <div class="mb-4 flex items-center gap-10">
          <input v-model="searchProduct" type="search" placeholder="Search for products..."
            class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />

          <!-- Add Product Button -->
          <router-link to="addproduct">
            <button class="my-2 px-5 py-2 bg-gray-900 text-white rounded flex items-center gap-2 hover:bg-gray-700">
              Add Product
              <Icon icon="fa-solid:pen-fancy" class="w-3 h-6 " />
            </button>
          </router-link>
        </div>

        <!-- Product Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-if="filteredProductItems.length === 0" class="text-gray-500">
            No products found.
          </div>

          <div v-for="(product, index) in filteredProductItems" :key="product.sku || index"
            class="p-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            :style="{ backgroundColor: getRandomColor() }">

            <!-- Product Image -->
            <img :src="product.image" alt="Product Image" class="w-full h-40 object-cover rounded-md" />

            <!-- Product Details -->
            <h2 class="mt-2 text-lg font-bold text-white">{{ product.title }}</h2>
            <p class="text-gray-200">{{ product.description }}</p>
            <p class="text-yellow-200 font-bold text-lg">${{ product.price }}</p>
            <p class="text-green-200 font-bold">Quantity: {{ product.stock }}</p>

            <!-- Edit Button -->
            <router-link :to="'/editproduct/' + product.sku">
              <button class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
                Edit
              </button>
            </router-link>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import { Icon } from "@iconify/vue";
import Sidebar from './Sidebar.vue';

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

onMounted(() => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }
});

// Search state
const searchProduct = ref("");

// Store products
const products = ref([]);

// Retrieve products from localStorage on page load
onMounted(() => {
  if (process.client) {
    try {
      const storedProducts = localStorage.getItem("products");
      console.log("Raw stored products:", storedProducts); // Debugging line
      products.value = storedProducts ? JSON.parse(storedProducts) : [];

      if (!Array.isArray(products.value)) {
        products.value = []; // Reset if data isn't an array
      }
      console.log("Parsed products array:", products.value); // Debugging line
    } catch (error) {
      console.error("Error parsing products from localStorage", error);
      products.value = []; // Fallback to an empty array on error
    }
  }
});

// Filter products by search
const filteredProductItems = computed(() => {
  console.log("Filtering products with query:", searchProduct.value);
  return products.value.filter(product => {
    console.log("Checking product:", product);
    return product.title?.toLowerCase().includes(searchProduct.value.toLowerCase());
  });
});

// Generate a random color for product cards
const getRandomColor = () => {
  const colors = ["#FF5733", "#33A1FF", "#28C76F", "#F5A623", "#A633FF", "#FF3366"];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debug watchEffect
watchEffect(() => {
  console.log("Filtered products computed:", filteredProductItems.value);
});
</script>

<style scoped>
/* Scoped Styles for Products component */
</style>