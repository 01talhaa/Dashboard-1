<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :shop="shop" :menuItems="menuItems" />

    <!-- Main Content -->
    <div class="flex-1 overflow-auto transition-all duration-300">
      <!-- Header (Sticky at Top) -->
      <header class="bg-white border-b sticky top-0 z-10">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold">User Transactions And Commissions</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/manageShop"
              class="w-9 h-9 rounded-full overflow-hidden cursor-pointer"
            >
              <img
                v-if="shop.logo"
                :src="shop.logo"
                alt="Shop Logo"
                class="w-full h-full object-cover"
              />
              <img
                v-else
                src="/avatar-placeholder.png"
                alt="Default Logo"
                class="w-full h-full object-cover"
              />
            </router-link>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="p-4 mt-0.5">
        <div class="container mx-auto p-6">
          

          <!-- Search and filters section -->
          <div class="bg-white p-4 rounded-lg shadow mb-6">
            <div class="flex flex-wrap gap-4">
              <div class="w-32">
                <select
                  v-model="searchColumn"
                  class="w-full p-2 border rounded-md"
                >
                  <option value="name">Name</option>
                  <option value="phone">Phone</option>
                  <option value="nid">NID</option>
                  
                </select>
              </div>

              <div class="flex-1 flex space-x-3">
                <div class="relative flex-1">
                  <input
                    type="text"
                    v-model="searchQuery"
                    @keyup.enter="searchUsers"
                    class="w-full p-2 border rounded-md pr-10"
                    :placeholder="`Search by ${searchColumn}...`"
                  />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      v-if="loading"
                      class="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </div>

                <button
                  @click="searchUsers"
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  :disabled="loading"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </button>

                <button
                  @click="clearSearch"
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  :disabled="loading"
                >
                  Clear
                </button>

                <button
                  @click="showAllTransactionsModal"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  :disabled="loading"
                >
                  All Transactions And Commissions
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-20">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
            ></div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="bg-red-50 p-4 rounded-md text-red-800 mb-6"
          >
            {{ error }}
          </div>

          <!-- Empty State -->
          <div
            v-else-if="users.length === 0"
            class="bg-white p-10 text-center rounded-lg shadow"
          >
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>

          <!-- Users Table -->
          <div v-else class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <!-- Table headers -->
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    NID
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Referral Code
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"
                        >
                          {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ user.name }}
                        </div>
                        <div class="text-xs text-gray-500">
                          Created: {{ formatDate(user.created_at) }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.phone || "N/A" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.nid || "N/A" }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600"
                  >
                    {{ user.referral_code || "N/A" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex space-x-2">
                      <button
                        @click="showTransactionsModal(user)"
                        class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <span class="mr-1">Transactions</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                      <button
                        @click="showApproveModal(user)"
                        class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <span>Approve Trx ID</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div
              class="mt-4 flex justify-center items-center space-x-4"
              v-if="!loading && !error && users.length > 0"
            >
              <button
                @click="previousPage"
                :disabled="currentPage <= 1"
                class="px-4 py-2 border rounded-md text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50"
              >
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

              <button
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="px-4 py-2 border rounded-md text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>

              <!-- Optional: Add items per page selector -->
              <select
                v-model="itemsPerPage"
                class="ml-4 px-2 py-1 border rounded-md"
              >
                <option :value="10">10 per page</option>
                <option :value="20">20 per page</option>
                <option :value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Transactions Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    >
      <div
        class="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
      >
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ selectedUser ? selectedUser.name + "'s" : "" }} Transactions
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="mt-4">
          <!-- User Information -->
          <div v-if="selectedUser" class="mb-6 p-4 bg-gray-50 rounded-md">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span class="text-sm text-gray-500">Name:</span>
                <div class="font-medium">{{ selectedUser.name }}</div>
              </div>
              <div>
                <span class="text-sm text-gray-500">Phone:</span>
                <div class="font-medium">{{ selectedUser.phone || 'N/A' }}</div>
              </div>
              <div>
                <span class="text-sm text-gray-500">Referral Code:</span>
                <div class="font-medium text-indigo-600">{{ selectedUser.referral_code || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <div
            v-if="loadingTransactions"
            class="flex justify-center items-center py-10"
          >
            <div
              class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"
            ></div>
          </div>

          <div
            v-else-if="userTransactions.length === 0"
            class="text-center py-10 text-gray-500"
          >
            No transactions found for this user.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Transaction ID
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="transaction in userTransactions"
                  :key="transaction.id"
                >
                  <td
                    class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{ transaction.id }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {{ transaction.type }}
                    <span v-if="transaction.from_user" class="text-xs text-gray-400 block">
                      From: {{ transaction.from_user }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium" 
                      :class="{'text-green-600': transaction.type.includes('Commission')}">
                    ${{ transaction.amount }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span
                      :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`"
                    >
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(transaction.date) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Transaction ID Modal -->
    <div
      v-if="showApproveModalState"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    >
      <div
        class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white"
      >
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h3 class="text-xl font-semibold text-gray-900">
            Approve Transaction ID for
            {{ selectedUser ? selectedUser.name : "" }}
          </h3>
          <button
            @click="closeApproveModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="mt-4">
          <div class="mb-4">
            <label
              class="block text-sm font-medium text-gray-700 mb-2"
              for="transaction-id"
            >
              Transaction ID
            </label>
            <input
              type="text"
              id="transaction-id"
              v-model="transactionIdToApprove"
              placeholder="Enter transaction ID"
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div class="flex justify-end">
            <button
              @click="approveTransactionId"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="!transactionIdToApprove || approving"
            >
              <span v-if="approving" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Approving...
              </span>
              <span v-else>Approve</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- All Transactions Modal -->
    <div
      v-if="showAllTransactionsModalState"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    >
      <div
        class="relative mx-auto border w-full max-w-6xl shadow-lg rounded-md bg-white flex flex-col"
        style="height: 80vh;"
      >
        <!-- Header -->
        <div class="p-5 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">
              All Users Transactions And Commissions
            </h3>
            <button @click="closeAllTransactionsModal" class="text-gray-400 hover:text-gray-600">
              <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content (Scrollable) -->
        <div class="flex-grow overflow-y-auto p-5">
          <div
            v-if="loadingAllTransactions"
            class="flex justify-center items-center py-10"
          >
            <div
              class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"
            ></div>
          </div>

          <div
            v-else-if="!allTransactions || allTransactions.length === 0"
            class="text-center py-10 text-gray-500"
          >
            No transactions found.
          </div>

          <div v-else>
            <div v-for="(userTx, index) in allTransactions" :key="`user-${userTx.user.id}-${index}`" class="mb-8">
              <!-- User Info Header -->
              <div class="bg-gray-50 p-4 rounded-t-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      {{ userTx.user.name.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-lg font-medium text-gray-900">{{ userTx.user.name }}</div>
                    <div class="flex text-xs text-gray-500 space-x-3">
                      <span>Phone: {{ userTx.user.phone || 'N/A' }}</span>
                      <span>Referral: {{ userTx.user.referral_code }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white shadow rounded-b-lg overflow-hidden mb-4">
                <!-- Transaction IDs Table -->
                <div v-if="userTx.transactionIds.result && userTx.transactionIds.result.length > 0" class="mb-4">
                  <h4 class="px-4 pt-4 text-sm font-semibold text-gray-700">Transaction IDs</h4>
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="transaction in userTx.transactionIds.result" :key="transaction.id">
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ transaction.id }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-indigo-600">{{ transaction.transactionId }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ formatDate(transaction.created_at) }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ formatDate(transaction.updated_at) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Commissions Table -->
                <div v-if="userTx.user.commissions && userTx.user.commissions.length > 0">
                  <h4 class="px-4 pt-4 text-sm font-semibold text-gray-700">Commissions</h4>
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(commission, i) in userTx.user.commissions" :key="`comm-${userTx.user.id}-${i}`">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ commission.from_user }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">${{ commission.amount }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ commission.level }}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <!-- Pagination for commissions if needed -->
                  <div v-if="userTx.user.pagination && userTx.user.pagination.last_page > 1" 
                       class="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div class="text-sm text-gray-700">
                      Showing {{ userTx.user.commissions.length }} of {{ userTx.user.pagination.total }} commissions
                    </div>
                    <div class="text-sm text-gray-500">
                      Page {{ userTx.user.pagination.current_page }} of {{ userTx.user.pagination.last_page }}
                    </div>
                  </div>
                </div>

                <div v-if="(!userTx.transactionIds.result || userTx.transactionIds.result.length === 0) && 
                           (!userTx.user.commissions || userTx.user.commissions.length === 0)" 
                     class="p-4 text-center text-sm text-gray-500">
                  No transaction data found for this user.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with Pagination (Fixed) -->
        <div class="p-4 border-t bg-gray-50">
          <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div class="text-sm text-gray-500">
              Showing {{ allTransactions.length }} of {{ allTransactionsTotalItems }} transactions
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Items per page:</span>
              <select
                v-model="allTransactionsPerPage"
                class="px-2 py-1 border rounded-md"
                @change="onAllTransactionsPerPageChange"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
            
            <div class="flex justify-center items-center space-x-4">
              <button
                @click="previousAllTransactionsPage"
                :disabled="allTransactionsCurrentPage <= 1"
                class="px-4 py-2 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Previous
              </button>

              <div class="flex items-center space-x-2">
                <span class="mx-2">
                  Page {{ allTransactionsCurrentPage }} of {{ allTransactionsTotalPages }}
                </span>
              </div>

              <button
                @click="nextAllTransactionsPage"
                :disabled="allTransactionsCurrentPage >= allTransactionsTotalPages"
                class="px-4 py-2 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { debounce } from "lodash-es";
import Sidebar from "./Sidebar.vue";

// Base URL for the API
const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

// Menu items definition (same as in customers.vue)
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
      {
        name: "User Transactions",
        path: "/user-transactions",
        icon: "FileText",
      },
    ],
  },
];

// Shop data
const shop = ref({
  name: "",
  logo: "",
  // Add other properties here as needed
});

// User state
const users = ref([]);
const loading = ref(false);
const error = ref(null);

// Search and filter state - Updated to match customers.vue
const searchQuery = ref("");
const searchColumn = ref("name"); // Default search column

// Debounce the search function like in customers.vue
const debouncedSearch = debounce(async () => {
  await searchUsers();
}, 300);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const totalPages = ref(1);

// Transaction modal state
const showModal = ref(false);
const selectedUser = ref(null);
const loadingTransactions = ref(false);
const userTransactions = ref([]);

// Approve Transaction ID modal state
const showApproveModalState = ref(false);
const transactionIdToApprove = ref("");
const approving = ref(false);

// All Transactions modal state
const showAllTransactionsModalState = ref(false);
const loadingAllTransactions = ref(false);
const allTransactions = ref([]);
const allTransactionsCurrentPage = ref(1);
const allTransactionsTotalPages = ref(1);
const allTransactionsTotalItems = ref(0);
const allTransactionsPerPage = ref(10);

// Get token from localStorage
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    // Try to parse the date string and format it
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    // If parsing fails, return the original string
    return dateString;
  }
};

// Methods
const fetchUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("page", currentPage.value);
    params.append("limit", itemsPerPage.value);

    if (searchQuery.value.trim()) {
      // Special handling for referral_code
      if (searchColumn.value === "referral_code") {
        // Try with 'referral' or 'code' instead of 'referral_code'
        params.append("where", `code,${searchQuery.value.trim()}`);
      } else {
        // Regular handling for other columns
        params.append("where", `${searchColumn.value},${searchQuery.value.trim()}`);
      }
      
      console.log('Search params:', {
        column: searchColumn.value,
        query: searchQuery.value.trim(),
        params: params.toString()
      });
    }

    const token = getToken();
    const response = await fetch(`${baseUrl}/users?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/"; // Redirect to login
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data) {
      users.value = data.data.result;
      totalItems.value = data.data.meta.total;
      totalPages.value = Math.ceil(data.data.meta.total / itemsPerPage.value);
      currentPage.value = parseInt(data.data.meta.page);

      console.log("Search results:", {
        query: searchQuery.value,
        column: searchColumn.value,
        results: users.value.length
      });
    } else {
      throw new Error("Failed to fetch users");
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = err.response?.data?.message || err.message || "Failed to fetch users";
  } finally {
    loading.value = false;
  }
};

const previousPage = async () => {
  if (currentPage.value > 1) {
    console.log("Moving to previous page:", currentPage.value - 1);
    currentPage.value--;
    await fetchUsers();
  }
};

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    console.log("Moving to next page:", currentPage.value + 1);
    currentPage.value++;
    await fetchUsers();
  }
};

// Update searchUsers to match customers.vue implementation
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    // If search query is empty, reset to first page
    currentPage.value = 1;
    await fetchUsers();
    return;
  }
  
  currentPage.value = 1;
  await fetchUsers();
};

// Add this function to clear search - match customers.vue
const clearSearch = async () => {
  searchQuery.value = "";
  searchColumn.value = "name"; // Reset to default search column
  currentPage.value = 1;
  await fetchUsers();
};

// Watch the search query and trigger the debounced search
watch(searchQuery, () => {
  debouncedSearch();
});

// Add a watcher for itemsPerPage changes
watch(itemsPerPage, async (newValue) => {
  console.log("Items per page changed to:", newValue);
  await fetchUsers(); // Reset to first page when changing items per page
});

// Add these methods for the transaction modal functionality
const showTransactionsModal = (user) => {
  selectedUser.value = user;
  showModal.value = true;
  fetchUserTransactions(user.id);
};

const closeModal = () => {
  showModal.value = false;
  selectedUser.value = null;
  userTransactions.value = [];
};

const fetchUserTransactions = async (userId) => {
  loadingTransactions.value = true;
  userTransactions.value = [];

  try {
    const token = getToken();
    const response = await fetch(`${baseUrl}/transactions/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      // Format the API response into our transaction display format
      if (data.data.transactionIds && data.data.transactionIds.result) {
        userTransactions.value = data.data.transactionIds.result.map(txn => ({
          id: txn.transactionId,
          type: "Transaction ID",
          amount: data.data.user.commissions && data.data.user.commissions.length > 0 
            ? data.data.user.commissions[0].amount 
            : "0.00",
          status: "completed",
          date: txn.created_at,
          created_at: txn.created_at,
          updated_at: txn.updated_at
        }));
      }
      
  
      
      console.log("Fetched transactions:", userTransactions.value);
    } else {
      console.warn("API returned success=false or no data");
      // If the API doesn't return data, we'll show an empty state
    }
  } catch (err) {
    console.error("Error fetching transactions:", err);
    error.value = err.message || "Failed to fetch transactions";
  } finally {
    loadingTransactions.value = false;
  }
};

// Add these methods for the approve transaction ID modal functionality
const showApproveModal = (user) => {
  selectedUser.value = user;
  showApproveModalState.value = true;
  transactionIdToApprove.value = ""; // Clear previous value
};

const closeApproveModal = () => {
  showApproveModalState.value = false;
  selectedUser.value = null;
  transactionIdToApprove.value = "";
};

const approveTransactionId = async () => {
  if (!transactionIdToApprove.value || !selectedUser.value) return;

  approving.value = true;

  try {
    const token = getToken();
    const response = await fetch(`${baseUrl}/transactions/apply-commissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: selectedUser.value.id,
        transactionId: transactionIdToApprove.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to approve transaction ID');
    }

    // Success handling
    alert(data.message || `Transaction ID ${transactionIdToApprove.value} has been approved successfully`);
    closeApproveModal();
    
    // Optionally refresh the user data to show updated balances
    fetchUsers();
    
  } catch (err) {
    console.error("Error approving transaction ID:", err);
    alert(`Error: ${err.message || "Failed to approve transaction ID"}`);
  } finally {
    approving.value = false;
  }
};

// Add these methods for the all transactions modal functionality
const showAllTransactionsModal = () => {
  showAllTransactionsModalState.value = true;
  allTransactionsCurrentPage.value = 1;
  fetchAllTransactions();
};

const closeAllTransactionsModal = () => {
  showAllTransactionsModalState.value = false;
  allTransactions.value = [];
};

const fetchAllTransactions = async () => {
  loadingAllTransactions.value = true;
  
  try {
    const token = getToken();
    const params = new URLSearchParams();
    params.append('transactions-page', allTransactionsCurrentPage.value);
    params.append('transactions-limit', allTransactionsPerPage.value);
    
    const response = await fetch(`${baseUrl}/transactions/users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      allTransactions.value = data.data.result;
      allTransactionsTotalItems.value = data.data.meta.total;
      allTransactionsTotalPages.value = data.data.meta.totalPage;
      
      console.log("Fetched all transactions:", {
        page: allTransactionsCurrentPage.value,
        totalPages: allTransactionsTotalPages.value,
        items: allTransactions.value.length,
        itemsPerPage: allTransactionsPerPage.value
      });
    } else {
      console.warn("API returned success=false or no data");
      // If the API doesn't return data, we'll show an empty state
      allTransactions.value = [];
    }
  } catch (err) {
    console.error("Error fetching all transactions:", err);
    alert(`Error: ${err.message || "Failed to fetch all transactions"}`);
    allTransactions.value = [];
  } finally {
    loadingAllTransactions.value = false;
  }
};

const previousAllTransactionsPage = async () => {
  if (allTransactionsCurrentPage.value > 1) {
    allTransactionsCurrentPage.value--;
    await fetchAllTransactions();
  }
};

const nextAllTransactionsPage = async () => {
  if (allTransactionsCurrentPage.value < allTransactionsTotalPages.value) {
    allTransactionsCurrentPage.value++;
    await fetchAllTransactions();
  }
};

const onAllTransactionsPerPageChange = async () => {
  allTransactionsCurrentPage.value = 1; // Reset to first page when changing items per page
  await fetchAllTransactions();
};

onMounted(() => {
  const savedShop = localStorage.getItem("shopData");
  if (savedShop) {
    shop.value = JSON.parse(savedShop);
  }

  fetchUsers();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
