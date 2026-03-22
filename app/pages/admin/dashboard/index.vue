<template>
  <div class="min-h-screen bg-[#f8f5f0] font-sans selection:bg-emerald-200">
    
    <!-- 1. LOGIN PAGE -->
    <div v-if="!isLoggedIn" class="min-h-screen flex items-center justify-center p-4">
      <!-- Background Decorative Elements -->
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-800 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-600 rounded-full blur-[120px]"></div>
      </div>

      <div class="relative w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <!-- Left Side: Visual Branding -->
        <div class="w-full md:w-1/2 bg-emerald-900 relative p-10 md:p-12 flex flex-col justify-between text-white overflow-hidden">
          <div class="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="thaiPattern" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="white" stroke-width="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#thaiPattern)" />
            </svg>
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
                  <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0A4.5 4.5 0 1 1 12 16.5M16.5 12H12m-4.5 0A4.5 4.5 0 1 0 12 16.5M7.5 12H12m0 0v4.5" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold tracking-tight">Nakarin Studio</h1>
            </div>
            <div class="space-y-2">
              <h2 class="text-2xl font-light leading-tight">นครินทร์ สตูดิโอ</h2>
              <p class="text-amber-400 font-medium italic text-lg">"ประณีตศิลป์ บายศรี และเครื่องสักการะ"</p>
            </div>
          </div>
          <div class="relative z-10 mt-8 md:mt-0">
            <p class="text-emerald-200/70 text-sm leading-relaxed max-w-xs">
              ระบบจัดการหลังบ้าน (Admin Dashboard) สำหรับการบริหารจัดการคิวและคำสั่งจองทำบายศรี
            </p>
          </div>
          <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-emerald-700/50 to-amber-600/30 rounded-full blur-3xl"></div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="w-full md:w-1/2 p-8 md:p-16 bg-white text-gray-800">
          <div class="max-w-sm mx-auto">
            <div class="mb-10 text-center md:text-left">
              <h3 class="text-2xl font-bold mb-2">เข้าสู่ระบบแอดมิน</h3>
              <p class="text-gray-500 text-sm">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบจัดการร้าน</p>
            </div>
            <form @submit.prevent="handleLogin" class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium block ml-1">ชื่อผู้ใช้งาน</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-focus-within:text-emerald-600">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input v-model="authForm.username" type="text" required class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all" placeholder="Username" />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center ml-1">
                  <label class="text-sm font-medium">รหัสผ่าน</label>
                  <a href="#" class="text-xs text-emerald-700 font-medium">ลืมรหัสผ่าน?</a>
                </div>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-focus-within:text-emerald-600">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input v-model="authForm.password" :type="isPasswordVisible ? 'text' : 'password'" required class="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all" placeholder="Password" />
                  <button type="button" @click="isPasswordVisible = !isPasswordVisible" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
                    <svg v-if="isPasswordVisible" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88 14.12 14.12"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              <button type="submit" :disabled="isSubmitting" class="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all transform active:scale-[0.98] disabled:opacity-70">
                <div v-if="isSubmitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span v-else>เข้าสู่ระบบ</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. DASHBOARD PAGE -->
    <div v-else class="min-h-screen flex text-gray-800">
      <!-- Sidebar -->
      <aside class="w-64 bg-emerald-900 text-white hidden lg:flex flex-col flex-shrink-0">
        <div class="p-6 border-b border-emerald-800/50 flex items-center gap-3">
          <div class="p-2 bg-amber-500 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0A4.5 4.5 0 1 1 12 16.5M16.5 12H12m-4.5 0A4.5 4.5 0 1 0 12 16.5M7.5 12H12m0 0v4.5" /><circle cx="12" cy="12" r="3" /></svg>
          </div>
          <span class="font-bold text-lg tracking-tight">Nakarin Admin</span>
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <a v-for="item in menuItems" :key="item.name" href="#" :class="['flex items-center gap-3 px-4 py-3 rounded-xl transition-all', item.active ? 'bg-amber-500 text-white' : 'hover:bg-emerald-800 text-emerald-100']">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium">{{ item.name }}</span>
          </a>
        </nav>
        <div class="p-4 border-t border-emerald-800/50">
          <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 w-full text-emerald-200 hover:text-white hover:bg-red-500/10 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span class="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 bg-[#f8f5f0] overflow-y-auto">
        <!-- Top Header -->
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-sm">
          <div class="flex items-center gap-4">
            <button class="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-emerald-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h2 class="text-xl font-bold text-gray-800 hidden md:block">แดชบอร์ดภาพรวม</h2>
          </div>
          <div class="flex items-center gap-3 md:gap-6">
            <div class="relative hidden sm:block">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" placeholder="ค้นหาการจอง..." class="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-48 focus:w-64 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right hidden md:block">
                <p class="text-xs font-bold text-gray-800">Admin Nakarin</p>
                <p class="text-[10px] text-gray-500 uppercase tracking-tighter">Super Admin</p>
              </div>
              <div class="w-10 h-10 bg-emerald-100 rounded-full border-2 border-emerald-900 flex items-center justify-center overflow-hidden">
                 <span class="text-emerald-900 font-bold">A</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Dashboard Widgets -->
        <div class="p-4 md:p-8 space-y-8">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:bg-amber-50 transition-colors pointer-events-none"></div>
              <div class="relative z-10 flex flex-col justify-between h-full">
                <div class="p-3 bg-emerald-50 text-emerald-700 w-fit rounded-2xl mb-4 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                  <component :is="stat.icon" class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-gray-500 text-sm font-medium">{{ stat.label }}</p>
                  <p class="text-3xl font-bold mt-1 text-gray-800 tracking-tight">{{ stat.value }}</p>
                  <div class="flex items-center mt-2 gap-1" :class="stat.trend > 0 ? 'text-emerald-600' : 'text-amber-600'">
                    <svg v-if="stat.trend > 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    <span class="text-[10px] font-bold tracking-wide">{{ Math.abs(stat.trend) }}% เทียบกับเดือนก่อน</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Grid: Recent Bookings & Calendar Summary -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <!-- Recent Bookings Table -->
            <div class="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div class="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-bold">คำสั่งจองทำบายศรีล่าสุด</h3>
                  <p class="text-xs text-gray-500 mt-1">อัปเดตสถานะการทำงานในแต่ละวัน</p>
                </div>
                <button class="text-sm font-bold text-emerald-700 hover:underline">ดูทั้งหมด</button>
              </div>
              <div class="overflow-x-auto flex-1">
                <table class="w-full text-left">
                  <thead class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                    <tr>
                      <th class="px-6 py-4">ลูกค้า / รูปแบบบายศรี</th>
                      <th class="px-6 py-4">วันที่จัดส่ง</th>
                      <th class="px-6 py-4">ยอดเงิน</th>
                      <th class="px-6 py-4 text-center">สถานะ</th>
                      <th class="px-6 py-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50 text-sm">
                    <tr v-for="booking in recentBookings" :key="booking.id" class="hover:bg-gray-50 transition-colors group">
                      <td class="px-6 py-5">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                            {{ booking.customer[0] }}
                          </div>
                          <div>
                            <p class="font-bold text-gray-800">{{ booking.customer }}</p>
                            <p class="text-[11px] text-gray-500">{{ booking.type }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <p class="font-medium text-gray-700">{{ booking.date }}</p>
                        <p class="text-[10px] text-gray-400">กำหนด: 10:00 น.</p>
                      </td>
                      <td class="px-6 py-5">
                        <p class="font-bold text-emerald-800">฿{{ booking.price.toLocaleString() }}</p>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <span :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase', 
                          booking.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-700' : 
                          booking.status === 'กำลังทำ' ? 'bg-amber-100 text-amber-700' : 
                          'bg-blue-100 text-blue-700']">
                          {{ booking.status }}
                        </span>
                      </td>
                      <td class="px-6 py-5 text-right">
                        <button class="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-emerald-900 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Quick Schedule -->
            <div class="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div class="relative z-10 space-y-6">
                 <h3 class="text-xl font-bold">ตารางงานวันนี้</h3>
                 <div class="space-y-4">
                   <div v-for="task in todayTasks" :key="task.time" class="flex gap-4 p-4 bg-emerald-800/50 rounded-2xl border border-emerald-700/50 hover:bg-emerald-800 transition-colors">
                     <div class="text-amber-400 font-bold text-sm min-w-[50px]">{{ task.time }}</div>
                     <div>
                       <p class="font-bold text-sm">{{ task.title }}</p>
                       <p class="text-[11px] text-emerald-300/70">{{ task.desc }}</p>
                     </div>
                   </div>
                 </div>
                 <button class="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-900/40 transition-all">
                   บันทึกคิวใหม่
                 </button>
               </div>
               <!-- Thai Pattern BG for card -->
               <div class="absolute -right-10 -bottom-10 opacity-20 pointer-events-none transform rotate-12">
                 <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="0.5"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
               </div>
            </div>
          </div>
        </div>

        <footer class="p-8 text-center text-gray-400 text-[10px] uppercase tracking-widest font-semibold border-t border-gray-100 bg-white/50">
          &copy; {{ currentYear }} Nakarin Studio Admin Portal. Handcrafted for Baisri Excellence.
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, markRaw } from 'vue';

// --- ICONS (Inline SVG Wrapper or Mocks for components) ---
const LayoutIcon = markRaw({
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`
});
const ShoppingBagIcon = markRaw({
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
});
const UsersIcon = markRaw({
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
});
const SettingsIcon = markRaw({
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
});

// --- STATES ---
const adminSession = useCookie<string | null>('admin_session')
const isLoggedIn = ref(Boolean(adminSession.value));
const isSubmitting = ref(false);
const isPasswordVisible = ref(false);
const authForm = reactive({ username: '', password: '' });

// --- DATA ---
const currentYear = computed(() => new Date().getFullYear());

const menuItems = [
  { name: 'แดชบอร์ด', icon: LayoutIcon, active: true },
  { name: 'รายการจอง', icon: ShoppingBagIcon, active: false },
  { name: 'ลูกค้า', icon: UsersIcon, active: false },
  { name: 'ตั้งค่าระบบ', icon: SettingsIcon, active: false },
];

const stats = [
  { label: 'ยอดจองทั้งหมด (เดือนนี้)', value: '154', trend: 12, icon: ShoppingBagIcon },
  { label: 'ยอดจองรอการยืนยัน', value: '18', trend: -5, icon: LayoutIcon },
  { label: 'ลูกค้ารายใหม่', value: '42', trend: 8, icon: UsersIcon },
  { label: 'รายได้ประเมิน', value: '฿125K', trend: 15, icon: ShoppingBagIcon },
];

const recentBookings = [
  { id: 1, customer: 'คุณหญิง สิริพร', type: 'บายศรีเทพ-บายศรีพรหม (คู่)', date: '25 มี.ค. 67', price: 12500, status: 'กำลังทำ' },
  { id: 2, customer: 'นายแพทย์ อุดม', type: 'บายศรีสู่ขวัญ (พิธีมงคลสมรส)', date: '26 มี.ค. 67', price: 8500, status: 'รอจัดส่ง' },
  { id: 3, customer: 'บริษัท ไทยเทค', type: 'บายศรีเปิดกิจการ', date: '24 มี.ค. 67', price: 4500, status: 'เสร็จสิ้น' },
  { id: 4, customer: 'คุณวิภาวรรณ', type: 'บายศรีพญานาค 7 เศียร', date: '28 มี.ค. 67', price: 18000, status: 'รอจัดส่ง' },
];

const todayTasks = [
  { time: '08:00', title: 'เตรียมใบตองสด', desc: 'สั่งใบตองตานี 20 กก. จากสวนราชบุรี' },
  { time: '11:00', title: 'เข้าตัวบายศรี', desc: 'งานคุณหญิงสิริพร (บายศรีเทพ)' },
  { time: '15:00', title: 'จัดส่งบายศรี', desc: 'ส่งที่วัดอรุณฯ งานบวชคุณมานพ' },
];

// --- METHODS ---
const handleLogin = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));
    adminSession.value = 'active'
    isLoggedIn.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

const handleLogout = async () => {
  adminSession.value = null
  isLoggedIn.value = false
  await navigateTo('/manage/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@200;400;500;700&display=swap');

.font-sans {
  font-family: 'Sarabun', sans-serif;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #064e3b;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>