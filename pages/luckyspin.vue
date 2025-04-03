<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar Component -->
    <Sidebar :shop="shop" :menuItems="menuItems" @logout="logout" />

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
            <div class="max-w-xl">
              <!-- Cooldown Times Row Container -->
              <div v-for="(time, index) in cooldownTimes" :key="index" class="flex items-center mb-2">
                <!-- Time Input with Clock Icon -->
                <div class="relative flex-1">
                  <input type="time" v-model="cooldownTimes[index]"
                    class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style="color-scheme: dark;" />
                  <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <!-- Remove Button -->
                <button @click="removeCooldownTime(index)"
                  class="ml-2 p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-white transition-colors">
                  <span>×</span>
                </button>

                <!-- Only show Add/Submit buttons for the last item in the list -->
                <div v-if="index === cooldownTimes.length - 1" class="flex ml-2 items-center">
                  <!-- <button @click="addCooldownTime"
                    class="px-4 py-2 mr-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    + Add
                  </button> -->
                  <button @click="submitCooldownTimes"
                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Submit
                  </button>
                </div>
              </div>
            </div>
            <!-- Update the structure of the section with tables -->
            <div class="mt-4 flex flex-col md:flex-row gap-6 items-start">
              <!-- Existing countdown section -->
              <div class="flex-1">
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

              <!-- New spinner schedule table -->
              <div class="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-3 w-full md:w-72">
                <h3 class="text-sm font-bold text-white mb-2 flex items-center">
                  <span class="mr-2">🕒</span> Upcoming Spins
                  <button @click="refreshSpinnerData"
                    class="ml-auto text-xs bg-purple-500/20 hover:bg-purple-500/40 p-1 px-2 rounded transition-colors">
                    Refresh
                  </button>
                </h3>

                <div v-if="spinnerLoading" class="flex justify-center py-4">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                </div>

                <div v-else class="max-h-48 overflow-y-auto pr-2 spinner-schedule">
                  <!-- Spinner table -->
                  <table class="w-full text-xs">
                    <thead class="text-white border-b border-white/10 sticky top-0 backdrop-blur-sm z-10">
                      <tr>
                        <th class="py-1 text-left">Time</th>
                        <th class="py-1 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="spin in spinners" :key="spin.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="py-1.5 text-white">{{ formatTime(spin.spin_time) }}</td>
                        <td class="py-1.5 flex justify-end space-x-2">
                          <!-- Edit button -->
                          <button @click.stop="openEditTimerModal(spin)"
                            class="p-1 rounded-full hover:bg-blue-500/20 text-white/70 hover:text-blue-300 transition-all"
                            title="Edit spin timer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                              fill="currentColor">
                              <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <!-- Fix the delete button X icon -->
                          <button @click.stop="deleteSpinTimer(spin.id)"
                            class="p-1 rounded-full hover:bg-red-500/20 text-white/70 hover:text-red-300 transition-all"
                            title="Delete spin timer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                              fill="currentColor">
                              <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="spinners.length === 0">
                        <td colspan="2" class="py-4 text-center text-purple-200">
                          No spins scheduled
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mt-2 text-xs text-purple-200 flex justify-between items-center">
                  <span v-if="spinnerError" class="text-red-300 text-xs">{{ spinnerError }}</span>
                  <span class="ml-auto whitespace-nowrap">
                    {{spinners.filter(s => new Date(s.spin_time_with_today_date).getTime() > Date.now()).length}}
                    upcoming / {{ spinners.length }} total
                  </span>
                </div>
              </div>

              <!-- Leaderboard table -->
              <div class="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-3 w-full md:w-72">
                <h3 class="text-sm font-bold text-white mb-2 flex items-center">
                  <span class="mr-2">🏆</span> Top 5 Players
                  <button @click="fetchLeaderboard"
                    class="ml-auto text-xs bg-purple-500/20 hover:bg-purple-500/40 p-1 px-2 rounded transition-colors">
                    Refresh
                  </button>
                </h3>

                <div v-if="leaderboardLoading" class="flex justify-center py-4">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                </div>

                <div v-else class="max-h-48 overflow-y-auto pr-2 leaderboard-table">
                  <table class="w-full text-xs">
                    <thead class="text-white border-b border-white/10 sticky top-0 backdrop-blur-sm z-10">
                      <tr>
                        <th class="py-1 text-left">Rank</th>
                        <th class="py-1 text-left">User</th>
                        <th class="py-1 text-right">Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="entry in leaderboardData" :key="entry.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="py-1.5">
                          <span class="font-bold" :class="getRankClass(entry.rank)">#{{ entry.rank }}</span>
                        </td>
                        <td class="py-1.5 text-white truncate max-w-[120px]">{{ entry.user.name }}</td>
                        <td class="py-1.5 text-right font-medium text-green-300">{{ entry.reward }}</td>
                      </tr>
                      <tr v-if="leaderboardData.length === 0">
                        <td colspan="3" class="py-4 text-center text-purple-200">
                          No leaderboard data
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mt-2 text-xs text-purple-200 flex justify-between items-center">
                  <span v-if="leaderboardError" class="text-red-300 text-xs">{{ leaderboardError }}</span>
                  <router-link to="/leaderboard" class="text-blue-300 hover:text-blue-200 transition-colors ml-auto">
                    View full leaderboard →
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spinner Section -->
        <div class="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
          <!-- Sparkle Effects -->
          <div class="absolute inset-0 overflow-hidden">
            <div v-for="n in 20" :key="n" class="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              :style="`top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 2}s`">
            </div>
          </div>

          <!-- Spinner Wheel Container -->
          <div class="relative flex justify-center items-center mb-8">
            <div class="w-96 h-96 relative">
              <!-- Pointer -->
              <div
                class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-b-lg z-10 shadow-lg">
              </div>

              <!-- Wheel -->
              <div
                class="w-full h-full rounded-full border-4 border-white/20 shadow-2xl relative overflow-hidden transform hover:scale-102 transition-transform duration-300"
                :style="{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 5s cubic-bezier(0.19, 0.94, 0.32, 1)' : 'none' }">
                <svg viewBox="0 0 100 100" class="absolute w-full h-full">
                  <g v-for="(item, index) in items" :key="index"
                    :transform="`rotate(${(360 / items.length) * index}, 50, 50)`">
                    <path :d="`M50,50 L100,50 A50,50 0 0,1 50,0 Z`"
                      :fill="index % 2 === 0 ? 'rgba(147, 51, 234, 0.9)' : 'rgba(219, 39, 119, 0.9)'"
                      stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
                    <text x="72" y="28" text-anchor="middle" transform="rotate(90, 72, 28)"
                      class="text-[8px] fill-white font-medium" style="font-size: 6px;">{{ item.value }}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <!-- Winner Display -->
          <div v-if="selectedItem"
            class="mt-6 text-center p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <h3 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              Winning Prize: {{ selectedItem.value }}! 🎉
            </h3>
          </div>
        </div>

        <!-- Items Grid -->
        <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="(item, index) in items" :key="index" @click="openEditModal(index)"
            class="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-300 group">
            <p class="text-white text-center group-hover:scale-105 transition-transform">{{ item.value }}</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
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

    <!-- Edit Timer Modal -->
    <div v-if="isEditTimerModalOpen"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div class="bg-gray-900 p-6 rounded-xl border border-white/20 max-w-sm w-full shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Edit Spin Timer</h3>

        <!-- Update the time input in the edit timer modal -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Spin Time</label>
          <div class="relative">
            <input type="time" v-model="editTimerForm.time"
              class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style="color-scheme: dark;" />
            <!-- Add a visible clock icon -->
            <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-1">Prize</label>
          <select v-model="editTimerForm.rotationPoint"
            class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option v-for="(item, index) in items" :key="index" :value="index">
              {{ item.value }}
            </option>
          </select>
        </div> -->

        <div class="flex justify-end gap-4">
          <button @click="closeEditTimerModal" class="px-4 py-2 text-gray-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button @click="saveEditedTimer"
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            :disabled="spinnerLoading">
            <span v-if="spinnerLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Saving...
            </span>
            <span v-else>Save</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, watch } from 'vue';
import axios from 'axios';
import Sidebar from './Sidebar.vue'; // Import the Sidebar component
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';

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

const router = useRouter();
const route = useRoute();

const isModalOpen = ref(false);
const selectedItemIndex = ref(null);
const newItemName = ref('');
const COOLDOWN_TIMES_KEY = "scheduled_cooldown_times";
const LAST_SPIN_ROTATION_KEY = "last_spin_rotation";
const COUNTDOWN_DATA_KEY = "countdown_data";
const cooldownTimes = ref([""]);
const countdown = ref("Set your spin schedule");
const shop = ref({ name: "", logo: "" });
const nextSpinTime = ref(null);
const scheduleMessage = ref("");
const spinTimers = ref([]);
const remainingSpins = ref(0);
const dailySchedule = ref([]);
const countdownInterval = ref(null);
const items = ref([]);
const rotation = ref(0);
const lastRotation = ref(0);
const spinning = ref(false);
const selectedItem = ref(null);
const selectedRotation = ref(0);
const selectedRotationIndex = ref(0);
const spinners = ref([]);
const rotationValues = [2475, 2430, 2385, 2340, 2295, 2250, 2205, 2160];
const currentSpinIndex = ref(0);
const spinnerLoading = ref(false);
const spinnerError = ref(null);

const isEditTimerModalOpen = ref(false);
const editTimerForm = ref({
  id: null,
  time: '',
  rotationPoint: 0,
  originalData: null
});

const upcomingSpins = computed(() => {
  if (!spinners.value || !Array.isArray(spinners.value)) {
    return [];
  }

  return [...spinners.value]
    .sort((a, b) => a.spin_time_in_ms - b.spin_time_in_ms)
    .filter(spin => {
      if (!spin.spin_time_with_today_date) return false;
      return new Date(spin.spin_time_with_today_date).getTime() > Date.now();
    })
    .slice(0, 10);
});

const formatTime = (timeStr) => {
  return timeStr || 'N/A';
};

const getPrizeValue = (rotationPoint) => {
  if (rotationPoint === undefined || rotationPoint === null) {
    return 'Unknown';
  }

  const point = parseInt(rotationPoint);
  if (!items.value || !items.value[point]) {
    return 'Unknown';
  }

  return items.value[point].value || 'Unknown';
};

const getPrizeColor = (rotationPoint) => {
  const point = parseInt(rotationPoint);
  const value = getPrizeValue(point);

  if (value >= 700) return 'text-yellow-300';
  if (value >= 500) return 'text-green-300';
  if (value >= 300) return 'text-blue-300';
  return 'text-white';
};

const saveCountdownData = () => {
  const countdownData = {
    nextSpinTime: nextSpinTime.value,
    remainingSpins: remainingSpins.value,
    scheduleMessage: scheduleMessage.value,
    countdown: countdown.value,
  };
  localStorage.setItem(COUNTDOWN_DATA_KEY, JSON.stringify(countdownData));
};

const saveLastRotation = () => {
  localStorage.setItem(LAST_SPIN_ROTATION_KEY, lastRotation.value.toString());
};

onMounted(async () => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }

  const savedRotation = localStorage.getItem(LAST_SPIN_ROTATION_KEY);
  if (savedRotation) {
    lastRotation.value = parseInt(savedRotation);
    rotation.value = lastRotation.value;
  }

  spinnerLoading.value = true;
  try {
    await fetchSpinnerItems();
  } catch (err) {
    spinnerError.value = "Error loading data";
  } finally {
    spinnerLoading.value = false;
  }

  const savedCountdownData = localStorage.getItem(COUNTDOWN_DATA_KEY);
  if (savedCountdownData) {
    const data = JSON.parse(savedCountdownData);
    nextSpinTime.value = data.nextSpinTime;
    remainingSpins.value = data.remainingSpins;
    scheduleMessage.value = data.scheduleMessage;
    countdown.value = data.countdown;
  }

  const savedTimeStrings = localStorage.getItem("cooldown_time_strings");
  if (savedTimeStrings) {
    cooldownTimes.value = JSON.parse(savedTimeStrings);
    dailySchedule.value = cooldownTimes.value;
  }

  const savedTimes = localStorage.getItem(COOLDOWN_TIMES_KEY);
  if (savedTimes) {
    const parsedTimes = JSON.parse(savedTimes);
    if (parsedTimes.length > 0) {
      const validTimes = parsedTimes.filter(item => item.time > Date.now());

      if (validTimes.length > 0) {
        nextSpinTime.value = validTimes[0].time;
        remainingSpins.value = validTimes.length;

        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(validTimes));
        saveCountdownData();

        startCountdown();
        scheduleAllSpins(validTimes);
      } else {
        nextSpinTime.value = null;
        remainingSpins.value = 0;
        scheduleMessage.value = "No more spins remaining today";
        countdown.value = "Set your spin schedule";
        saveCountdownData();

        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify([]));
      }
    }
  } else if (nextSpinTime.value) {
    startCountdown();
  }

  fetchLeaderboard();
});

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
  spinTimers.value.forEach(timer => clearTimeout(timer));
});

const fetchSpinnerItems = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found! Please log in first.');
      return;
    }

    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/spinner`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.data.success && response.data.data) {
      items.value = response.data.data.items || [];
      spinners.value = response.data.data.spinner || [];
      console.log('Items fetched successfully:', items.value);
      console.log('Spinners fetched successfully:', spinners.value);
    } else {
      console.error('Invalid response format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    items.value = [];
    spinners.value = [];
  }
};

const openEditModal = (index) => {
  selectedItemIndex.value = index;
  newItemName.value = items.value[index].value;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  newItemName.value = '';
};

const saveItemName = () => {
  if (selectedItemIndex.value !== null && newItemName.value.trim() !== '') {
    items.value[selectedItemIndex.value].value = newItemName.value;
    sendItemsToServer();
    closeModal();
  }
};

const addCooldownTime = () => {
  cooldownTimes.value.push("");
  localStorage.setItem("cooldown_time_strings", JSON.stringify(cooldownTimes.value));
};

const removeCooldownTime = (index) => {
  if (cooldownTimes.value.length > 1) {
    cooldownTimes.value.splice(index, 1);
    localStorage.setItem("cooldown_time_strings", JSON.stringify(cooldownTimes.value));
  }
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + date.toLocaleDateString();
};

const submitCooldownTimes = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    // Get only the most recently added time (last in the array)
    const validTimes = cooldownTimes.value.filter(time => time.trim() !== "");
    if (validTimes.length === 0) {
      scheduleMessage.value = "Please add at least one valid time";
      saveCountdownData();
      return;
    }

    // Get only the latest added time
    const latestTime = validTimes[validTimes.length - 1];

    // Check if this time already exists
    const existingTimes = spinners.value.map(spin => spin.spin_time_24h);
    if (existingTimes.includes(latestTime)) {
      scheduleMessage.value = "This time is already scheduled";
      saveCountdownData();
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Use only the latest time
    const randomIndex = Math.floor(Math.random() * 8);
    const [hours, minutes] = latestTime.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00 ${period}`;

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/spinner`,
      {
        spin_time: formattedTime,
        rotation_point: randomIndex.toString()
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log(`API Schedule Created - Time: ${formattedTime}, Index: ${randomIndex}`);
      console.log('API Response:', response.data);

      // Save the list of time strings to localStorage
      localStorage.setItem("cooldown_time_strings", JSON.stringify(cooldownTimes.value));

      // Refresh spinner data to get latest schedule
      await refreshSpinnerData();

      if (spinners.value.length > 0) {
        const scheduleWithIndices = spinners.value
          .filter(s => new Date(s.spin_time_with_today_date).getTime() > Date.now())
          .map(s => ({
            time: new Date(s.spin_time_with_today_date).getTime(),
            index: parseInt(s.rotation_point)
          }))
          .sort((a, b) => a.time - b.time);

        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(scheduleWithIndices));

        if (scheduleWithIndices.length > 0) {
          nextSpinTime.value = scheduleWithIndices[0].time;
          remainingSpins.value = scheduleWithIndices.length;
          saveCountdownData();
          startCountdown();
          scheduleAllSpins(scheduleWithIndices);
        }
      }

      // Show success message for the newly added timer
      scheduleMessage.value = `Successfully scheduled spin for ${formattedTime}`;
      saveCountdownData();

      // Optionally clear the input field after adding
      cooldownTimes.value[cooldownTimes.value.length - 1] = "";
    }
  } catch (error) {
    console.error('Error scheduling spin:', error);
    scheduleMessage.value = "Error scheduling spin. Please try again.";
    saveCountdownData();
  }
};

const scheduleAllSpins = (schedule) => {
  spinTimers.value.forEach(timer => clearTimeout(timer));
  spinTimers.value = [];

  schedule.forEach(({ time, index }) => {
    const delay = time - Date.now();
    if (delay > 0) {
      const timer = setTimeout(() => {
        spin(index);

        remainingSpins.value--;
        saveCountdownData();

        const remainingSchedule = JSON.parse(localStorage.getItem(COOLDOWN_TIMES_KEY) || "[]")
          .filter(item => item.time > Date.now());
        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(remainingSchedule));

        if (remainingSchedule.length === 0) {
          nextSpinTime.value = null;
          scheduleMessage.value = "No more spins remaining today";
          countdown.value = "Set your spin schedule";
          saveCountdownData();
          if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
          }
        } else {
          nextSpinTime.value = remainingSchedule[0].time;
          saveCountdownData();
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
    saveCountdownData();
    return;
  }

  countdownInterval.value = setInterval(() => {
    const remainingTime = nextSpinTime.value - Date.now();

    if (remainingTime <= 0) {
      clearInterval(countdownInterval.value);
      countdown.value = "Spinning now...";
      saveCountdownData();
    } else {
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      countdown.value = `Next spin in: ${hours}h ${minutes}m ${seconds}s`;
      saveCountdownData();
    }
  }, 1000);
};

const spin = async (predeterminedIndex = null) => {
  if (spinning.value) return;
  spinning.value = true;

  try {
    const index = predeterminedIndex !== null ? predeterminedIndex : Math.floor(Math.random() * 8);

    selectedRotationIndex.value = index;
    const targetRotation = rotationValues[index];
    selectedRotation.value = lastRotation.value + 1800 + (targetRotation - (lastRotation.value % 360));

    rotation.value = selectedRotation.value;

    lastRotation.value = selectedRotation.value;
    saveLastRotation();

    console.log(`Spinning with index: ${index}, Item: ${items.value[index]?.value}, Rotation: ${selectedRotation.value}`);

    setTimeout(() => {
      spinning.value = false;
      selectedItem.value = items.value[selectedRotationIndex.value];
    }, 5000);
  } catch (error) {
    console.error('Error during spin:', error);
    spinning.value = false;
  }
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

    if (response.data.success) {
      console.log('Items sent successfully:', response.data);
      items.value = response.data.data.items;
    }
  } catch (error) {
    console.error('Error sending items:', error);
  }
};

const refreshSpinnerData = async () => {
  spinnerLoading.value = true;
  spinnerError.value = null;

  try {
    await fetchSpinnerItems();
  } catch (error) {
    spinnerError.value = 'Failed to refresh spinner data. Please try again.';
  } finally {
    spinnerLoading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  router.push('/');
};

const deleteSpinTimer = async (id) => {
  try {
    spinnerLoading.value = true;
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found! Please log in first.');
      return;
    }

    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/spinner/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log(`Successfully deleted spinner with id ${id}`);
      spinners.value = spinners.value.filter(spin => spin.id !== id);

      scheduleMessage.value = `Successfully deleted spin timer`;
      saveCountdownData();

      refreshSpinnerData();
    }
  } catch (error) {
    console.error(`Error deleting spinner ${id}:`, error);
    spinnerError.value = 'Failed to delete spinner. Please try again.';
  } finally {
    spinnerLoading.value = false;
  }
};

const openEditTimerModal = (spin) => {
  let time24h = spin.spin_time_24h;

  editTimerForm.value = {
    id: spin.id,
    time: time24h,
    rotationPoint: parseInt(spin.rotation_point),
    originalData: { ...spin }
  };

  isEditTimerModalOpen.value = true;
};

const closeEditTimerModal = () => {
  isEditTimerModalOpen.value = false;
  editTimerForm.value = {
    id: null,
    time: '',
    rotationPoint: 0,
    originalData: null
  };
};

const saveEditedTimer = async () => {
  try {
    spinnerLoading.value = true;
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found! Please log in first.');
      return;
    }

    const [hours, minutes] = editTimerForm.value.time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00 ${period}`;

    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/spinner/${editTimerForm.value.id}`,
      {
        spin_time: formattedTime,
        rotation_point: editTimerForm.value.rotationPoint.toString()
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('Timer updated successfully:', response.data);

      const index = spinners.value.findIndex(s => s.id === editTimerForm.value.id);
      if (index !== -1) {
        spinners.value[index] = response.data.data;
      }

      updateLocalSchedule();

      scheduleMessage.value = 'Spin timer updated successfully';
      saveCountdownData();

      closeEditTimerModal();

      await refreshSpinnerData();
    }
  } catch (error) {
    console.error('Error updating timer:', error);
    spinnerError.value = 'Failed to update timer. Please try again.';
  } finally {
    spinnerLoading.value = false;
  }
};

const updateLocalSchedule = () => {
  if (spinners.value.length > 0) {
    const scheduleWithIndices = spinners.value
      .filter(s => new Date(s.spin_time_with_today_date).getTime() > Date.now())
      .map(s => ({
        time: new Date(s.spin_time_with_today_date).getTime(),
        index: parseInt(s.rotation_point)
      }))
      .sort((a, b) => a.time - b.time);

    localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(scheduleWithIndices));

    if (scheduleWithIndices.length > 0) {
      nextSpinTime.value = scheduleWithIndices[0].time;
      remainingSpins.value = scheduleWithIndices.length;
      saveCountdownData();
      startCountdown();
      scheduleAllSpins(scheduleWithIndices);
    } else {
      nextSpinTime.value = null;
      remainingSpins.value = 0;
      scheduleMessage.value = "No more spins remaining today";
      countdown.value = "Set your spin schedule";
      saveCountdownData();
    }
  }
};

const leaderboardData = ref([]);
const leaderboardLoading = ref(false);
const leaderboardError = ref(null);

const fetchLeaderboard = async () => {
  try {
    leaderboardLoading.value = true;
    leaderboardError.value = null;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found! Please log in first.');
      return;
    }

    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leaderboard`, {
      params: {
        limit: 5
      },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    if (response.data.success) {
      leaderboardData.value = response.data.data.result;
      console.log('Leaderboard data loaded:', leaderboardData.value.length);
    } else {
      leaderboardError.value = 'Failed to load leaderboard';
      console.error('Invalid leaderboard response:', response.data);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    leaderboardError.value = 'Error loading leaderboard';
  } finally {
    leaderboardLoading.value = false;
  }
};
const getRankClass = (rank) => {
  if (rank === 1) return 'text-yellow-300';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-white';
};

onMounted(() => {
  fetchLeaderboard();
});
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

.text-sm {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.025em;
}

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

.transition-transform {
  transition: transform 0.3s ease;
}

.scale-102 {
  --tw-scale-x: 1.02;
  --tw-scale-y: 1.02;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

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

.spinner-schedule {
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.5) rgba(255, 255, 255, 0.05);
}

.spinner-schedule::-webkit-scrollbar {
  width: 4px;
}

.spinner-schedule::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.spinner-schedule::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.5);
  border-radius: 3px;
}

.spinner-schedule::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
}

@media (max-width: 640px) {
  .spinner-schedule {
    max-height: 150px;
  }
}

.spinner-schedule thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Update these CSS styles for time input appearance */
input[type="time"] {
  color-scheme: dark;
  padding-right: 28px !important;
  /* Reduced padding */
}

/* Make time picker icon more visible but smaller */
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  opacity: 0.7;
  position: absolute;
  right: 8px;
  height: 16px;
  /* Smaller size */
  width: 16px;
  /* Smaller size */
}

/* Better clock icon visibility with smaller size */
.time-input-container .clock-icon {
  pointer-events: none;
  z-index: 2;
}

/* Make the custom clock icon smaller */
.absolute.inset-y-0.right-3 svg {
  width: 14px !important;
  height: 14px !important;
}

input[type="time"] {
  color-scheme: dark;
  padding-right: 30px !important;
  /* Ensure space for the clock icon */
}

/* Firefox specific styling */
@-moz-document url-prefix() {
  input[type="time"] {
    appearance: textfield;
  }
}

/* Make time picker icon more visible */
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  opacity: 0.7;
  position: absolute;
  right: 10px;
  height: 20px;
  width: 20px;
}

/* Better clock icon visibility */
.time-input-container .clock-icon {
  pointer-events: none;
  z-index: 2;
}

.spinner-schedule td button svg {
  width: 14px !important;
  height: 14px !important;
  display: block;
}

.spinner-schedule td button {
  min-width: 22px;
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-schedule td .space-x-1>*+* {
  margin-left: 0.5rem !important;
}

.leaderboard-table {
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.5) rgba(255, 255, 255, 0.05);
}

.leaderboard-table::-webkit-scrollbar {
  width: 4px;
}

.leaderboard-table::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.leaderboard-table::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.5);
  border-radius: 3px;
}

.leaderboard-table::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
}

/* .leaderboard-table td.max-w-[120px] {
max-width: 120px;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
} */
</style>