<template>
  <section class="admin-page space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold tracking-wide text-[#48645d]">Order Management</p>
          <h1 class="mt-1 text-2xl font-bold text-[#21423b] md:text-3xl">รายการคำสั่งซื้อสินค้า</h1>
        </div>
      </div>
    </header>

    <section class="panel rounded-2xl p-5 md:p-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <label class="field-block min-w-[220px]">
          <span class="field-label">กรองสถานะ</span>
          <div class="relative">
            <button type="button" class="field-input field-dropdown-btn" @click.stop="toggleFilterMenu">
              {{ statusFilter }}
            </button>
            <ul v-if="isFilterMenuOpen" class="dropdown dropdown-down dropdown-full menu rounded-xl bg-white shadow-md" @click.stop>
              <li>
                <button type="button" class="dropdown-item" @click="selectFilter('ทั้งหมด')">ทั้งหมด</button>
              </li>
              <li v-for="status in orderStatuses" :key="status">
                <button type="button" class="dropdown-item" @click="selectFilter(status)">{{ status }}</button>
              </li>
            </ul>
          </div>
        </label>
        <span class="text-xs text-[#5f7871]">แสดง {{ filteredOrders.length }} จาก {{ orders.length }} รายการ</span>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in filteredOrders" :key="item.id" class="panel rounded-2xl p-4">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold tracking-wide text-[#5a7770]">{{ item.referenceNo }}</p>
            <h2 class="mt-1 text-lg font-bold text-[#21423b]">{{ item.customerName }}</h2>
          </div>
          <span class="badge-brand rounded-full px-3 py-1 text-xs font-semibold">{{ item.status }}</span>
        </div>

        <dl class="grid gap-2 text-sm text-[#4f6660]">
          <div class="flex items-center justify-between gap-2">
            <dt>สินค้า</dt>
            <dd class="font-semibold text-[#21423b]">{{ item.itemName }}</dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt>กำหนดรับสินค้า</dt>
            <dd class="font-semibold text-[#21423b]">{{ item.dueDate }}</dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt>ยอดรวม</dt>
            <dd class="font-semibold text-[#21423b]">{{ item.amount.toLocaleString() }} บาท</dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt>โทรศัพท์</dt>
            <dd class="font-semibold text-[#21423b]">{{ item.phone }}</dd>
          </div>
        </dl>

        <div class="mt-3 grid gap-2">
          <label class="field-block">
            <span class="field-label">เปลี่ยนสถานะ</span>
            <div class="relative">
              <button type="button" class="field-input field-dropdown-btn" @click.stop="toggleStatusMenu(item.id)">
                {{ statusDrafts[item.id] }}
              </button>
              <ul v-if="openStatusMenuId === item.id" class="dropdown dropdown-down dropdown-full menu rounded-xl bg-white shadow-md" @click.stop>
                <li v-for="status in orderStatuses" :key="status">
                  <button type="button" class="dropdown-item" @click="selectStatus(item.id, status)">{{ status }}</button>
                </li>
              </ul>
            </div>
          </label>
          <button class="btn-brand rounded-xl px-3 py-2 text-xs font-semibold" @click="handleSaveStatus(item.id)">บันทึกสถานะ</button>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
          <NuxtLink :to="`/admin/order/${item.id}`" class="link-brand text-sm font-semibold">รายละเอียดคำสั่งซื้อ</NuxtLink>
          <div class="relative">
            <button type="button" class="btn-menu rounded-xl px-3 py-2 text-xs font-semibold" @click.stop="toggleMenu(item.id)">
              เมนูจัดการ
            </button>
            <ul v-if="openMenuId === item.id" class="dropdown menu w-44 rounded-xl bg-white shadow-md" @click.stop>
              <li>
                <NuxtLink :to="`/admin/order/${item.id}`" class="dropdown-item" @click="closeMenu">รายละเอียด</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </article>
    </section>

  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useAdminMvpStore } from '~/composables/useAdminMvpStore'
import type { AdminOrder } from '~/data/admin-mvp'

definePageMeta({
  layout: 'admin'
})

const { orders, updateOrderStatus } = useAdminMvpStore()
const { showToast } = useAdminToast()

const orderStatuses: AdminOrder['status'][] = ['ใหม่', 'กำลังจัดทำ', 'พร้อมรับสินค้า', 'ส่งมอบแล้ว']
const statusFilter = ref<'ทั้งหมด' | AdminOrder['status']>('ทั้งหมด')
const statusDrafts = reactive<Record<string, AdminOrder['status']>>({})
const openMenuId = ref<string | null>(null)
const openStatusMenuId = ref<string | null>(null)
const isFilterMenuOpen = ref(false)

const filteredOrders = computed(() => {
  if (statusFilter.value === 'ทั้งหมด') return orders.value
  return orders.value.filter((item) => item.status === statusFilter.value)
})

const closeMenu = () => {
  openMenuId.value = null
  openStatusMenuId.value = null
  isFilterMenuOpen.value = false
}

const toggleMenu = (id: string) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const toggleFilterMenu = () => {
  isFilterMenuOpen.value = !isFilterMenuOpen.value
}

const selectFilter = (value: 'ทั้งหมด' | AdminOrder['status']) => {
  statusFilter.value = value
  isFilterMenuOpen.value = false
}

const toggleStatusMenu = (id: string) => {
  openStatusMenuId.value = openStatusMenuId.value === id ? null : id
}

const selectStatus = (id: string, status: AdminOrder['status']) => {
  statusDrafts[id] = status
  openStatusMenuId.value = null
}

const handleSaveStatus = (id: string) => {
  const draft = statusDrafts[id]
  if (!draft) return

  const success = updateOrderStatus(id, draft, 'Admin', 'อัปเดตสถานะจากหน้ารายการคำสั่งซื้อ')
  showToast(success ? 'success' : 'info', success ? 'บันทึกสถานะเรียบร้อย' : 'ไม่มีการเปลี่ยนแปลง')
}

watch(
  orders,
  (items) => {
    for (const item of items) {
      statusDrafts[item.id] = item.status
    }

    for (const id of Object.keys(statusDrafts)) {
      if (!items.some((item) => item.id === id)) {
        delete statusDrafts[id]
      }
    }
  },
  { immediate: true, deep: true }
)

const onWindowClick = () => {
  closeMenu()
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onWindowClick)
})
</script>

<style scoped>
.admin-page {
  background: radial-gradient(circle at 95% 0%, rgba(6, 95, 70, 0.12), transparent 32%), #f8f5f0;
}

.panel {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(6, 95, 70, 0.14);
}

.field-block {
  display: grid;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #49625b;
  letter-spacing: 0.02em;
}

.field-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.96);
  padding: 0.55rem 0.75rem;
  color: #1f3d36;
}

.field-input:focus {
  border-color: rgba(15, 118, 110, 0.6);
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
}

.btn-brand {
  color: #fff;
  background: linear-gradient(120deg, #0f766e, #065f46);
}

.btn-brand:hover {
  filter: brightness(1.06);
}

.btn-menu {
  color: #0f766e;
  border: 1px solid rgba(15, 118, 110, 0.28);
  background: rgba(240, 253, 250, 0.95);
}

.btn-menu:hover {
  color: #fff;
  border-color: #0f766e;
  background: #0f766e;
}

.badge-brand {
  color: #065f46;
  border: 1px solid rgba(5, 150, 105, 0.24);
  background: rgba(5, 150, 105, 0.12);
}

.link-brand {
  color: #0f766e;
}

.link-brand:hover {
  color: #115e59;
  text-decoration: underline;
}

.dropdown {
  position: absolute;
  top: auto;
  bottom: calc(100% + 0.35rem);
  right: 0;
  z-index: 20;
  border: 1px solid rgba(6, 95, 70, 0.14);
  padding: 0.35rem;
  list-style: none;
}

.dropdown-full {
  left: 0;
  right: 0;
}

.dropdown-down {
  top: calc(100% + 0.35rem);
  bottom: auto;
}

.field-dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.field-dropdown-btn::after {
  content: "▾";
  margin-left: 0.5rem;
  color: #4b6861;
  font-size: 0.72rem;
}

.dropdown-item {
  display: block;
  width: 100%;
  border-radius: 0.6rem;
  padding: 0.45rem 0.65rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #21423b;
}

.dropdown-item:hover {
  background: rgba(6, 95, 70, 0.1);
}

</style>
