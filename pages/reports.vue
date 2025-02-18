<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :shop="shop" :menuItems="menuItems" />

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
        <div class="container mx-auto p-8 bg-gray-50 rounded-xl shadow-lg">
          <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">Sales Report</h1>

          <!-- Monthly Income Table -->
          <div class="grid grid-cols-7 gap-6 mb-8">
            <div v-for="day in daysInMonth" :key="day" class="text-center">
              <p class="text-lg font-small text-gray-700 mb-2">Day {{ day }}</p>
              <input type="number" v-model="income[day - 1]" @input="handleInput(day - 1)"
                class="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300"
                :placeholder="'Enter income for day ' + day" />
            </div>
          </div>

          <!-- Total Income and Store Button -->
          <div class="text-center mb-8">
            <p class="text-xl font-semibold text-gray-800">Total Income: ${{ formatNumber(totalIncome) }}</p>
            <button @click="confirmStoreAsPreviousMonthSales"
              class="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300">
              Store as Previous Month Sales
            </button>
          </div>

          <!-- Previous Month Sales Display -->
          <div class="text-center mb-8">
            <p class="text-lg font-semibold text-gray-600">Previous Month Sales:
              ${{ formatNumber(previousMonthSales) }}</p>
          </div>

          <!-- Sales Comparison -->
          <div v-if="previousMonthSales > 0" class="text-center mb-8">
            <p v-if="totalIncome > previousMonthSales" class="text-lg font-semibold text-blue-600">
              Current month sales are higher by ${{ formatNumber(totalIncome - previousMonthSales) }}
            </p>
            <p v-if="totalIncome < previousMonthSales" class="text-lg font-semibold text-yellow-600">
              Current month sales are lower by ${{ formatNumber(previousMonthSales - totalIncome) }}
            </p>
            <p v-if="totalIncome === previousMonthSales" class="text-lg font-semibold text-gray-600">
              Current month sales are equal to previous month's sales.
            </p>
          </div>

          <!-- Payment Methods (Cash on Delivery, Mobile Pay, Cash on Store) -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(payment, index) in paymentMethods" :key="index"
              class="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">{{ payment.name }}</h3>
              <input type="number" v-model="payment.amount" @input="handleInput(payment)"
                class="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 mb-4 transition duration-300"
                :placeholder="'Enter ' + payment.name + ' amount'" />
              <div class="flex justify-center gap-6 mb-4">
                <button @click="addPaymentAmount(payment)"
                  class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                  Add
                </button>
                <button @click="resetPaymentAmount(payment)"
                  class="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition duration-300">
                  Reset
                </button>
              </div>
              <p class="text-lg font-semibold text-gray-600">Total {{ payment.name }}:
                ${{ formatNumber(payment.sum) }}</p>
            </div>
          </div>

          <!-- Confirmation Modal -->
          <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div class="bg-white p-8 rounded-lg shadow-xl w-96 max-w-lg">
              <h3 class="text-xl font-semibold text-gray-800 mb-6">Are you sure?</h3>
              <p class="text-lg text-gray-700 mb-6">Are you sure you want to store the current month's total income as
                the previous month's sales?</p>
              <div class="flex justify-between gap-4">
                <button @click="storeAsPreviousMonthSales"
                  class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300">
                  Yes
                </button>
                <button @click="showConfirmation = false"
                  class="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-300">
                  No
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
import { ref, computed, onMounted, watch } from 'vue';
import Sidebar from './Sidebar.vue'; // Import the Sidebar component

//Sidebar properties
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

const income = ref(new Array(31).fill(0)); // 31 days in the month
const previousMonthSales = ref(0);
const paymentMethods = ref([
  { name: 'Cash on Delivery', amount: 0, sum: 0 },
  { name: 'Mobile Pay', amount: 0, sum: 0 },
  { name: 'Cash on Store', amount: 0, sum: 0 },
]);

const formatNumber = (value) => value.toFixed(2);

const totalIncome = computed(() => income.value.reduce((sum, dailyIncome) => sum + dailyIncome, 0));

const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

const showConfirmation = ref(false);

const handleInput = (index) => {
  if (income.value[index] === "") {
    income.value[index] = 0;
  }
}

const addPaymentAmount = (payment) => {
  payment.sum += parseFloat(payment.amount);
  payment.amount = 0;
}

const resetPaymentAmount = (payment) => {
  payment.sum = 0;
  payment.amount = 0;
}

const storeAsPreviousMonthSales = () => {
  previousMonthSales.value = totalIncome.value;
  income.value = new Array(31).fill(0);
  paymentMethods.value.forEach(payment => {
    payment.sum = 0;
  });
  showConfirmation.value = false;
  saveDataToLocalStorage(); // Save data after storing sales
}

// Show the confirmation modal
const confirmStoreAsPreviousMonthSales = () => {
  showConfirmation.value = true;
}

// Save data to localStorage
const saveDataToLocalStorage = () => {
  const salesData = {
    previousMonthSales: previousMonthSales.value,
    totalIncome: totalIncome.value,
    cashOnDeliverySum: paymentMethods.value[0].sum,
    mobilePaySum: paymentMethods.value[1].sum,
    cashOnStoreSum: paymentMethods.value[2].sum
  };
  localStorage.setItem("salesData", JSON.stringify(salesData));
}

// Load data from localStorage
const loadDataFromLocalStorage = () => {
  const savedSalesData = localStorage.getItem("salesData");
  if (savedSalesData) {
    const data = JSON.parse(savedSalesData);
    previousMonthSales.value = data.previousMonthSales;
    totalIncome.value = data.totalIncome;
    paymentMethods.value[0].sum = data.cashOnDeliverySum;
    paymentMethods.value[1].sum = data.mobilePaySum;
    paymentMethods.value[2].sum = data.cashOnStoreSum;
  }

  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }
}

onMounted(() => {
  loadDataFromLocalStorage();
});

watch([income, previousMonthSales, paymentMethods], () => {
  saveDataToLocalStorage();
}, { deep: true });

</script>

<style scoped>
/* General container styles */
.container {
  max-width: 1200px;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 16px;
}

/* Inputs and buttons */
input[type="number"] {
  width: 100%;
  text-align: center;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

button {
  cursor: pointer;
}

/* Card style for payment methods */
.bg-white {
  background-color: #fff;
}

/* Input transition */
input[type="number"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>