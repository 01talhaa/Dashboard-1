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
                  :style="{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.4, 2, 0.55, 1)' : 'none' }">
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
                You won: {{ items[selectedRotationIndex].value }}! 🎉
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
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

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

const searchQuery = ref("");
const filteredMenuItems = computed(() => {
  return menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const isModalOpen = ref(false);
const selectedItemIndex = ref(null);
const newItemName = ref('');
const COOLDOWN_TIMES_KEY = "scheduled_cooldown_times";
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
const spinning = ref(false);
const selectedItem = ref(null);
const selectedRotation = ref(0);
const selectedRotationIndex = ref(0);
const rotationValues = [2475, 2430, 2385, 2340, 2295, 2250, 2205, 2160];
const spinners = ref([]);
const currentSpinIndex = ref(0);

onMounted(() => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }

  fetchSpinnerItems();

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
      const validTimes = parsedTimes.filter(item => item.time > Date.now());

      if (validTimes.length > 0) {
        nextSpinTime.value = validTimes[0].time;
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

    items.value = response.data.data.items;
    spinners.value = response.data.data.spinners;
    console.log('Items fetched successfully:', items.value);
  } catch (error) {
    console.error('Error fetching items:', error);
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

// Update the submitCooldownTimes function to handle time format correctly
const submitCooldownTimes = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const validTimes = cooldownTimes.value.filter(time => time.trim() !== "");
    if (validTimes.length === 0) {
      scheduleMessage.value = "Please add at least one valid time";
      return;
    }

    // Create new schedules with proper time format
    for (const time of validTimes) {
      // Generate random index between 0-7
      const randomIndex = Math.floor(Math.random() * 8);

      // Convert 24-hour format to 12-hour format with AM/PM
      const [hours, minutes] = time.split(':').map(Number);
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
      }
    }

    // Verify the update
    const verifyResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/spinner`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (verifyResponse.data.success) {
      console.log('Current API Schedule:', verifyResponse.data.data.spinner);
      spinners.value = verifyResponse.data.data.spinner;

      // Update local state
      const scheduleWithIndices = verifyResponse.data.data.spinner.map(s => ({
        time: new Date(s.spin_time_with_today_date).getTime(),
        index: parseInt(s.rotation_point)
      }));

      localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(scheduleWithIndices));

      if (scheduleWithIndices.length > 0) {
        nextSpinTime.value = scheduleWithIndices[0].time;
        remainingSpins.value = scheduleWithIndices.length;
        startCountdown();
        scheduleAllSpins(scheduleWithIndices);
      }

      scheduleMessage.value = `Successfully scheduled ${validTimes.length} spin(s)`;
    }

  } catch (error) {
    console.error('Error scheduling spins:', error);
    scheduleMessage.value = "Error scheduling spins. Please try again.";
  }
};

const scheduleAllSpins = (schedule) => {
  schedule.forEach(({ time, index }) => {
    const delay = time - Date.now();
    if (delay > 0) {
      const timer = setTimeout(() => {
        // Use the random pre-determined index for this spin
        spin(index);

        remainingSpins.value--;

        // Remove this time from the schedule
        const remainingSchedule = JSON.parse(localStorage.getItem(COOLDOWN_TIMES_KEY) || "[]")
          .filter(item => item.time > Date.now());
        localStorage.setItem(COOLDOWN_TIMES_KEY, JSON.stringify(remainingSchedule));

        if (remainingSchedule.length === 0) {
          nextSpinTime.value = null;
          scheduleMessage.value = "No more spins remaining today";
          countdown.value = "Set your spin schedule";
          if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
          }
        } else {
          nextSpinTime.value = remainingSchedule[0].time;
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

// Update the spin function to use the stored index
const spin = async (predeterminedIndex = null) => {
  if (spinning.value) return;
  spinning.value = true;

  try {
    // Use the predetermined index from schedule
    const index = predeterminedIndex !== null ? predeterminedIndex : Math.floor(Math.random() * 8);

    selectedRotation.value = rotationValues[index];
    selectedRotationIndex.value = index;
    rotation.value = selectedRotation.value;

    // Log the winning item
    console.log(`Spinning with index: ${index}, Item: ${items.value[index]?.value}`);

    setTimeout(() => {
      spinning.value = false;
      selectedItem.value = items.value[selectedRotationIndex.value];
    }, 3000);
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
</style>