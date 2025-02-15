<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar (keeping original structure) -->
    <aside class="w-2/5 sm:w-64 bg-gray-900 text-white transition-all duration-300 flex-shrink-0 overflow-auto">
      <div class="p-2 sm:p-4">
        <div class="flex items-center gap-2 text-sm sm:text-xl font-bold">
          <div class="w-6 sm:w-8 h-6 sm:h-8 bg-red-500 rounded-lg"></div>
          <span class="ml-3">{{ shop.name ? shop.name + "'s" : 'ACTIVE' }}<span
              class="text-red-500">Platform</span></span>
        </div>
      </div>

      <div class="px-2 sm:px-4 mt-2 sm:mt-6">
        <input v-model="searchQuery" type="search" placeholder="Search"
          class="w-full px-2 sm:px-4 py-1 sm:py-2 bg-gray-800 rounded-md text-xs sm:text-sm" />
      </div>

      
      <nav class="mt-3 sm:mt-6">
        <template v-for="(item, index) in filteredMenuItems" :key="index">
          <router-link :to="item.path"
          class="flex items-center px-2 sm:px-4 py-2 sm:py-3 text-gray-300 hover:bg-gray-800">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="ml-3">{{ item.name }}</span>
        </router-link>
        
        
      </template>
    </nav>
    
    <router-link to="/" class="mx-7 py-80 text-red-500 text-left block">
      Logout
    </router-link>
  </aside>
  
  <!-- Main Content -->
  <div class="flex-1 overflow-auto transition-all duration-300">
    <!-- Header -->
    <header class="bg-white border-b sticky top-0 z-10">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-4">
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-4">
            <router-link to="/manageShop" class="w-9 h-9 rounded-full overflow-hidden cursor-pointer">
              <img v-if="shop.logo" :src="shop.logo" alt="Shop Logo" class="w-full h-full object-cover" />
              <img v-else src="/avatar-placeholder.png" alt="Default Logo" class="w-full h-full object-cover" />
            </router-link>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Enhanced Main Content -->
    <main class="p-6 bg-gradient-to-br from-gray-900 to-purple-900 min-h-[calc(100vh-64px)]">
      <div class="max-w-7xl mx-auto">
        <!-- Cooldown Section with Multiple Times -->
        <div class="mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="mr-2">⏱️</span> Set Cooldown Times
          </h2>
          <div class="mb-2">
            <div v-for="(time, index) in cooldownTimes" :key="index" class="flex items-center mb-2">
              <input type="time" v-model="cooldownTimes[index]"
              class="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              <button @click="removeCooldownTime(index)"
              class="ml-2 p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-white transition-colors">
              <span>×</span>
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-4 items-center mt-4">
          <button @click="addCooldownTime"
          class="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          + Add Time
        </button>
        <button @click="submitCooldownTimes"
        class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        Submit All Times
      </button>
    </div>
    <div class="mt-4">
      <p class="text-xl font-medium text-purple-300">{{ countdown }}</p>
      <div v-if="nextSpinTime" class="mt-2 text-sm text-purple-300">
        Next spin at: {{ formatDateTime(nextSpinTime) }}
      </div>
      <div v-if="scheduleMessage" class="mt-2 text-sm text-green-300">
        {{ scheduleMessage }}
      </div>
      <div v-if="remainingSpins > 0" class="mt-2 text-sm text-amber-300">
        {{ remainingSpins }} spins remaining today
      </div>
    </div>
  </div>
  
  
  
  
  <!-- Spinner Section -->
  
  
  <div class="wrap" @click="launchWheel">
    <FortuneWheel ref="wheel" v-model="gift" :middle-circle="true" :imgParams="logo" :data="data" @done="done" />
  </div>
  


          <!-- Edit Modal -->
          <div v-if="isModalOpen"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
            <div class="bg-gray-900 p-6 rounded-xl border border-white/20 max-w-sm w-full shadow-2xl">
              <h3 class="text-xl font-bold text-white mb-4">Edit Item Name</h3>
              <input v-model="newItemName"
                class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              <div class="mt-6 flex justify-end gap-4">
                <button @click="closeModal" class="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button @click="saveItemName"
                  class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                  Save
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { FortuneWheel } from 'vue3-fortune-wheel';
import type { Data } from 'vue3-fortune-wheel';

// Type definitions
interface ImgParams {
  src: string;
  width: number;
  height: number;
}

interface MenuItem {
  name: string;
  path: string;
  icon: string;
  active?: boolean;
}

// Initialize refs with proper typing
const gift = ref<number>(4);
const wheel = ref<InstanceType<typeof FortuneWheel> | null>(null);
const data = ref<Data[]>([
  {
    id: 1,
    value: "Gift 1",
    bgColor: "#7d7db3",
    color: "#ffffff",
  },
  {
    id: 2,
    value: "Gift 2",
    bgColor: "#ffffff",
    color: "#000000",
  },
  {
    id: 3,
    value: "Gift 3",
    bgColor: "#c92729",
    color: "#ffffff",
  },
  {
    id: 4,
    value: "Gift 4",
    bgColor: "#7d7db3",
    color: "#ffffff",
  },
  {
    id: 5,
    value: "Gift 5",
    bgColor: "#ffffff",
    color: "#000000",
  },
  {
    id: 6,
    value: "Gift 6",
    bgColor: "#c92729",
    color: "#ffffff",
  },
]);

const logo: ImgParams = {
  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/2367px-Vue.js_Logo_2.svg.png",
  width: 100,
  height: 120,
};

const done = (r: Data) => {
  console.log("done", r);
};

const launchWheel = () => {
  if (wheel.value) wheel.value.spin();
};

const menuItems: MenuItem[] = [
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

// Refs with proper typing
const searchQuery = ref<string>("");
const isModalOpen = ref<boolean>(false);
const selectedItemIndex = ref<number | null>(null);
const newItemName = ref<string>('');
const cooldownTimes = ref<string[]>([""]);
const canSpin = ref<boolean>(true);
const countdown = ref<string>("Set your spin schedule");
const shop = ref<{ name: string; logo: string }>({ name: "", logo: "" });
const nextSpinTime = ref<number | null>(null);
const scheduleMessage = ref<string>("");
const spinTimers = ref<number[]>([]);
const remainingSpins = ref<number>(0);
const dailySchedule = ref<string[]>([]);
const items = ref<string[]>(["Item-1", "Item-2", "Item-3", "Item-4", "Item-5", "Item-6", "Item-7", "Item-8"]);
const rotation = ref<number>(0);
const spinning = ref<boolean>(false);
const selectedItem = ref<string | null>(null);
const selectedRotation = ref<number>(0);
const selectedRotationIndex = ref<number>(0);

const cooldownActive = ref<boolean>(false);
const countdownInterval = ref<null>(null);
// Constants
const COOLDOWN_TIMES_KEY = "scheduled_cooldown_times";
const rotationValues = [2475, 2430, 2385, 2340, 2295, 2250, 2205, 2160];

// Computed properties with proper typing
const filteredMenuItems = computed(() => {
  return menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const openEditModal = (index) => {
  selectedItemIndex.value = index;
  newItemName.value = items.value[index];
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  newItemName.value = '';
};

const saveItemName = () => {
  if (selectedItemIndex.value !== null && newItemName.value.trim() !== '') {
    items.value[selectedItemIndex.value] = newItemName.value;
    localStorage.setItem("items", JSON.stringify(items.value));
    sendItemsToServer();
    closeModal();
  }
};

const addCooldownTime = () => {
  cooldownTimes.value.push("");
};

const removeCooldownTime = (index) => {
  if (cooldownTimes.value.length > 1) {
    cooldownTimes.value.splice(index, 1);
  }
};


const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + date.toLocaleDateString();
};


const submitCooldownTimes = () => {
  // Clear any existing timers
  spinTimers.value.forEach(timer => clearTimeout(timer));
  spinTimers.value = [];

  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }

  // Filter out empty time entries
  const validTimes = cooldownTimes.value.filter(time => time.trim() !== "");

  if (validTimes.length === 0) {
    scheduleMessage.value = "Please add at least one valid time";
    return;
  }

  
  const now = new Date();
  let todaySchedule = [];

  validTimes.forEach(timeString => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const spinTime = new Date(now);
    spinTime.setHours(hours, minutes, 0, 0);

    // If time has already passed today, schedule for tomorrow
    if (spinTime <= now) {
      spinTime.setDate(spinTime.getDate() + 1);
    }

    todaySchedule.push(spinTime.getTime());
  });

  // Sort times chronologically
  todaySchedule.sort((a, b) => a - b);

  // Store the original time strings and the calculated schedule
  localStorage.setItem("cooldown_time_strings", JSON.stringify(validTimes));
  localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(todaySchedule));

  // Keep the daily schedule for reference
  dailySchedule.value = validTimes;

  // Set next spin time and start countdown
  if (todaySchedule.length > 0) {
    nextSpinTime.value = todaySchedule[0];
    remainingSpins.value = todaySchedule.length;
    startCountdown();

    // Schedule all spins
    scheduleAllSpins(todaySchedule);

    scheduleMessage.value = `Scheduled ${todaySchedule.length} spin${todaySchedule.length > 1 ? 's' : ''} for today`;
  }
};

const scheduleAllSpins = (times) => {
  times.forEach(time => {
    const delay = time - Date.now();
    if (delay > 0) {
      const timer = setTimeout(() => {
        spin();

        // Decrease remaining spins count
        remainingSpins.value--;

        // Remove this time from the schedule
        const remainingTimes = JSON.parse(localStorage.getItem(COOLDOWN_TIMES_KEY) || "[]")
          .filter(t => t > Date.now());
        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(remainingTimes));

        // Update UI based on remaining spins
        if (remainingTimes.length === 0) {
          // No more spins today
          nextSpinTime.value = null;
          scheduleMessage.value = "No more spins remaining today";
          countdown.value = "Set your spin schedule";
          // Clear the countdown interval
          if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
          }
        } else {
          // Update next spin time
          nextSpinTime.value = remainingTimes[0];
          startCountdown();
        }
      }, delay);

      spinTimers.value.push(timer);
    }
  });
};

const startCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }

  if (!nextSpinTime.value) {
    countdown.value = "Set your spin schedule";
    return;
  }

  countdownInterval.value = setInterval(() => {
    const remainingTime = nextSpinTime.value - Date.now();

    if (remainingTime <= 0) {
      clearInterval(countdownInterval.value);
      countdown.value = "Spinning now...";
    } else {
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      countdown.value = `Next spin in: ${hours}h ${minutes}m ${seconds}s`;
    }
  }, 1000);
};

onMounted(() => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }

  const savedItems = localStorage.getItem("items");
  if (savedItems) {
    items.value = JSON.parse(savedItems);
  }

  // Load time strings first
  const savedTimeStrings = localStorage.getItem("cooldown_time_strings");
  if (savedTimeStrings) {
    cooldownTimes.value = JSON.parse(savedTimeStrings);
    dailySchedule.value = cooldownTimes.value;
  }

  // Load scheduled cooldown times
  const savedTimes = localStorage.getItem(COOLDOWN_TIMES_KEY);
  if (savedTimes) {
    const parsedTimes = JSON.parse(savedTimes);
    if (parsedTimes.length > 0) {
      // Filter out past times
      const validTimes = parsedTimes.filter(time => time > Date.now());

      if (validTimes.length > 0) {
        nextSpinTime.value = validTimes[0];
        remainingSpins.value = validTimes.length;

        // Update localStorage with filtered times
        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(validTimes));

        // Start countdown and schedule spins
        startCountdown();
        scheduleAllSpins(validTimes);
      } else {
        // All times have passed, reset UI
        nextSpinTime.value = null;
        remainingSpins.value = 0;
        scheduleMessage.value = "No more spins remaining today";
        countdown.value = "Set your spin schedule";

        // Clear localStorage of today's schedule but keep the time strings
        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify([]));
      }
    }
  }
});

// Add helper function for countdown display
const updateCountdownDisplay = (remainingTime: number) => {
  const hours = Math.floor(remainingTime / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
  countdown.value = `${hours}h ${minutes}m ${seconds}s left`;
};


const spin = () => {
  if (spinning.value) return;

  spinning.value = true;

  // Generate a new random rotation
  const randomIndex = Math.floor(Math.random() * rotationValues.length);
  selectedRotation.value = rotationValues[randomIndex];
  selectedRotationIndex.value = randomIndex;
  rotation.value = selectedRotation.value;

  setTimeout(() => {
    spinning.value = false;
    selectedItem.value = items.value[selectedRotationIndex.value];
  }, 3000);
};

const sendItemsToServer = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found! Please log in first.');
      return;
    }

    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/spinner-items`,
      { items: items.value },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );




    console.log('Items sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending items:', error);
  }
};
</script>

<style scoped>
@keyframes twinkle {

  0%,
  100% {
    opacity: 0;
    transform: scale(0.5);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-twinkle {
  animation: twinkle 2s infinite;
}

/* Enhanced text styling */
.text-sm {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.5);
  border-radius: 3px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.7);
}

/* Transitions */
.transition-transform {
  transition: transform 0.3s ease;
}

.scale-102 {
  --tw-scale-x: 1.02;
  --tw-scale-y: 1.02;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

/* Glass effect */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

/* Additional animations */
@keyframes glow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(147, 51, 234, 0.5),
      0 0 10px rgba(147, 51, 234, 0.3);
  }

  50% {
    box-shadow: 0 0 10px rgba(147, 51, 234, 0.7),
      0 0 20px rgba(147, 51, 234, 0.5);
  }
}

.glow-effect {
  animation: glow 2s infinite;
}

.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem auto;
  width: 100%;
  max-width: 500px;
}
</style>