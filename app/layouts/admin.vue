<template>
  <div class="admin-shell h-screen overflow-hidden">
    <aside class="admin-sidebar flex h-screen w-[250px] shrink-0 flex-col border-r border-white/15 bg-[#0d3f33] text-white md:w-[290px]">
      <div class="border-b border-white/10 px-6 py-5">
        <p class="text-xs uppercase tracking-[0.18em] text-emerald-200">Nakarin Studio</p>
        <h1 class="mt-1 text-xl font-bold">นครินทร์ สตูดิโอ</h1>
      </div>

      <nav class="flex-1 overflow-hidden px-4 py-5">
        <NuxtLink to="/admin/dashboard" class="nav-link mb-3 flex items-center rounded-xl px-4 py-3 text-sm font-semibold" :class="isActive('/admin/dashboard') ? 'active' : ''">
          แดชบอร์ด
        </NuxtLink>

        <section class="accordion-block" :class="{ 'is-open': openedSection === 'product' }">
          <button type="button" class="accordion-title" @click="openedSection = 'product'">
            ส่วนจัดการสินค้า
          </button>
          <div v-show="openedSection === 'product'" class="accordion-content text-sm">
            <div class="accordion-items">
              <NuxtLink to="/admin/product" class="nav-link" :class="isActive('/admin/product') && !isActive('/admin/product/category') ? 'active' : ''">
                รายการสินค้า
              </NuxtLink>
              <NuxtLink to="/admin/product/category" class="nav-link" :class="isActive('/admin/product/category') ? 'active' : ''">
                รายการหมวดหมู่สินค้า
              </NuxtLink>
            </div>
          </div>
        </section>

        <section class="accordion-block" :class="{ 'is-open': openedSection === 'order' }">
          <button type="button" class="accordion-title" @click="openedSection = 'order'">
            ส่วนจัดการคำสั่งซื้อ
          </button>
          <div v-show="openedSection === 'order'" class="accordion-content text-sm">
            <div class="accordion-items">
              <NuxtLink to="/admin/order" class="nav-link" :class="isActive('/admin/order') ? 'active' : ''">
                รายการคำสั่งซื้อ
              </NuxtLink>
              <NuxtLink to="/admin/booking" class="nav-link" :class="isActive('/admin/booking') ? 'active' : ''">
                รายการสั่งจองสินค้า
              </NuxtLink>
            </div>
          </div>
        </section>

        <section class="accordion-block" :class="{ 'is-open': openedSection === 'schedule' }">
          <button type="button" class="accordion-title" @click="openedSection = 'schedule'">
            ส่วนตารางเวลา
          </button>
          <div v-show="openedSection === 'schedule'" class="accordion-content text-sm">
            <div class="accordion-items">
              <NuxtLink to="/admin/schedule" class="nav-link" :class="isActive('/admin/schedule') ? 'active' : ''">
                รายการตารางเวลา (ปฏิทิน)
              </NuxtLink>
            </div>
          </div>
        </section>
      </nav>
    </aside>

    <div class="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
      <header class="admin-topbar sticky top-0 z-20 border-b border-white/40 bg-[#f8f5f0]/95 backdrop-blur">
        <div class="flex items-center justify-between px-4 py-3 md:px-6">
          <div class="lg:hidden">
            <button type="button" class="mobile-toggle rounded-lg px-3 py-2 text-sm font-semibold" @click="mobileOpen = !mobileOpen">
              เมนูแอดมิน
            </button>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <button type="button" class="icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path d="M10 17a2 2 0 0 0 4 0" />
              </svg>
            </button>
            <button type="button" class="icon-btn" aria-label="Profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20a8 8 0 0 1 16 0" />
              </svg>
            </button>
            <button type="button" class="logout-btn rounded-lg px-3 py-2 text-sm font-semibold" @click="handleLogout">
              ออกจากระบบ
            </button>
          </div>
        </div>

        <div v-if="mobileOpen" class="mobile-menu border-t border-white/40 px-4 py-3 lg:hidden">
          <NuxtLink to="/admin/dashboard" class="mobile-link" @click="mobileOpen = false">แดชบอร์ด</NuxtLink>
          <NuxtLink to="/admin/product" class="mobile-link" @click="mobileOpen = false">รายการสินค้า</NuxtLink>
          <NuxtLink to="/admin/product/category" class="mobile-link" @click="mobileOpen = false">รายการหมวดหมู่สินค้า</NuxtLink>
          <NuxtLink to="/admin/order" class="mobile-link" @click="mobileOpen = false">รายการคำสั่งซื้อ</NuxtLink>
          <NuxtLink to="/admin/booking" class="mobile-link" @click="mobileOpen = false">รายการสั่งจองสินค้า</NuxtLink>
          <NuxtLink to="/admin/schedule" class="mobile-link" @click="mobileOpen = false">รายการตารางเวลา</NuxtLink>
        </div>
      </header>

      <main class="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const route = useRoute()
const mobileOpen = ref(false)
const adminSession = useCookie<string | null>('admin_session')
const openedSection = ref<'product' | 'order' | 'schedule' | ''>('')

const isActive = (path: string) => route.path.startsWith(path)

watch(
  () => route.path,
  () => {
    mobileOpen.value = false
    if (route.path.startsWith('/admin/dashboard')) {
      openedSection.value = ''
      return
    }

    if (route.path.startsWith('/admin/product')) openedSection.value = 'product'
    if (route.path.startsWith('/admin/order') || route.path.startsWith('/admin/booking')) openedSection.value = 'order'
    if (route.path.startsWith('/admin/schedule')) openedSection.value = 'schedule'
  },
  { immediate: true }
)

const handleLogout = async () => {
  adminSession.value = null
  await navigateTo('/manage/login')
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 95% 0%, rgba(6, 95, 70, 0.12), transparent 35%), #f8f5f0;
}

.admin-sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
}

.nav-link {
  display: block;
  color: #d6f3ea;
  border: 1px solid transparent;
  transition: all 0.18s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.08);
}

.nav-link.active {
  color: #fff;
  background: rgba(4, 120, 87, 0.55);
  border-color: rgba(167, 243, 208, 0.35);
}

.accordion-block {
  margin-bottom: 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
}

.accordion-title {
  width: 100%;
  text-align: left;
  position: relative;
  display: block;
  padding: 0.65rem 2.1rem 0.65rem 0.8rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: #d6f3ea;
  cursor: pointer;
}

.accordion-title::after {
  content: '';
  position: absolute;
  right: 0.85rem;
  top: 50%;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid rgba(214, 243, 234, 0.9);
  border-bottom: 2px solid rgba(214, 243, 234, 0.9);
  transform: translateY(-65%) rotate(45deg);
  transition: transform 0.18s ease;
}

.accordion-content {
  padding: 0.25rem 0.45rem 0.55rem;
}

.accordion-block.is-open .accordion-title::after {
  transform: translateY(-35%) rotate(225deg);
}

.accordion-items {
  padding-left: 0.3rem;
  display: grid;
  gap: 0.2rem;
}

.accordion-items .nav-link {
  font-size: 0.86rem;
  border-radius: 10px;
  padding: 0.5rem 0.7rem;
}

.icon-btn {
  height: 36px;
  width: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(6, 95, 70, 0.2);
  color: #065f46;
  background: rgba(255, 255, 255, 0.78);
}

.logout-btn,
.mobile-toggle {
  color: #065f46;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.78);
}

.logout-btn:hover,
.mobile-toggle:hover {
  background: #065f46;
  color: #fff;
}

.mobile-menu {
  display: grid;
  gap: 0.32rem;
}

.mobile-link {
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  font-size: 0.9rem;
  color: #21423b;
}

.mobile-link:hover {
  background: rgba(6, 95, 70, 0.1);
}
</style>
