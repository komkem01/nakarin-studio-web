<template>
  <section class="dashboard space-y-4">
    <header class="panel rounded-2xl p-4 md:p-5">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-[#5a7770]">Dashboard Overview</p>
          <h1 class="mt-1 text-2xl font-bold text-[#21423b] md:text-3xl">ภาพรวมระบบหลังบ้าน</h1>
          <p class="mt-1 text-sm text-[#4f6660]">คำสั่งซื้อ, งานจอง, สินค้า และคิวงานในหน้าจอเดียว</p>
        </div>
        <p class="text-sm font-semibold text-[#36524b]">อัปเดตล่าสุด {{ nowLabel }}</p>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in statCards" :key="card.label" class="panel rounded-2xl p-4">
        <p class="text-xs uppercase tracking-[0.14em] text-[#5a7770]">{{ card.label }}</p>
        <p class="mt-2 text-3xl font-bold text-[#21423b]">{{ card.value }}</p>
        <p class="mt-1 text-xs text-[#4f6660]">{{ card.hint }}</p>
      </article>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <article class="panel rounded-2xl p-4 md:p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-bold text-[#21423b]">รายการล่าสุด</h2>
          <NuxtLink to="/admin/order" class="link-brand text-sm font-semibold">ดูคำสั่งซื้อทั้งหมด</NuxtLink>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-[#5a7770]">
                <th class="pb-2 pr-3 font-semibold">เลขอ้างอิง</th>
                <th class="pb-2 pr-3 font-semibold">ลูกค้า</th>
                <th class="pb-2 pr-3 font-semibold">ประเภท</th>
                <th class="pb-2 pr-3 font-semibold">สถานะ</th>
                <th class="pb-2 text-right font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in latestRows" :key="item.id" class="border-t border-[#e4eeea]">
                <td class="py-2 pr-3 font-semibold text-[#21423b]">{{ item.referenceNo }}</td>
                <td class="py-2 pr-3 text-[#36524b]">{{ item.customerName }}</td>
                <td class="py-2 pr-3">
                  <span class="badge-brand rounded-full px-2 py-0.5 text-xs">{{ item.kind }}</span>
                </td>
                <td class="py-2 pr-3 text-[#36524b]">{{ item.status }}</td>
                <td class="py-2 text-right">
                  <NuxtLink :to="item.to" class="link-brand text-sm font-semibold">เปิด</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <div class="grid gap-4">
        <article class="panel rounded-2xl p-4 md:p-5">
          <h2 class="text-lg font-bold text-[#21423b]">สรุปสถานะงาน</h2>
          <div class="mt-3 space-y-2">
            <div v-for="item in statusSummary" :key="item.label" class="status-row">
              <p class="text-sm text-[#36524b]">{{ item.label }}</p>
              <p class="text-sm font-semibold text-[#21423b]">{{ item.count }}</p>
            </div>
          </div>
        </article>

        <article class="panel rounded-2xl p-4 md:p-5">
          <h2 class="text-lg font-bold text-[#21423b]">ทางลัด</h2>
          <div class="mt-3 grid gap-2">
            <NuxtLink v-for="item in quickPages" :key="item.to" :to="item.to" class="quick-link rounded-xl p-3">
              <p class="text-sm font-semibold text-[#21423b]">{{ item.title }}</p>
              <p class="mt-1 text-xs text-[#4f6660]">{{ item.desc }}</p>
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminMvpStore } from '~/composables/useAdminMvpStore'

definePageMeta({
  layout: 'admin'
})

const { orders, bookings, catalog } = useAdminMvpStore()

const nowLabel = computed(() => {
  return new Date().toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const statCards = computed(() => {
  const pendingOrders = orders.value.filter((item) => item.status === 'ใหม่').length
  const pendingBookings = bookings.value.filter((item) => item.status === 'รอยืนยัน').length
  const readyOrders = orders.value.filter((item) => item.status === 'พร้อมรับสินค้า').length
  const activeProducts = catalog.value.filter((item) => item.isActive).length
  const estimatedValue = orders.value.reduce((sum, item) => sum + item.amount, 0)

  return [
    { label: 'คำสั่งซื้อใหม่', value: pendingOrders, hint: 'รอทีมงานยืนยัน' },
    { label: 'งานจองรอยืนยัน', value: pendingBookings, hint: 'ควรติดต่อกลับวันนี้' },
    { label: 'รายการพร้อมส่งมอบ', value: readyOrders, hint: 'แจ้งลูกค้าเข้ารับสินค้า' },
    { label: 'มูลค่างานรวม', value: `฿${estimatedValue.toLocaleString()}`, hint: `สินค้าที่เปิดขาย ${activeProducts} รายการ` }
  ]
})

const latestRows = computed(() => {
  const orderRows = orders.value.slice(0, 4).map((item) => ({
    id: item.id,
    referenceNo: item.referenceNo,
    customerName: item.customerName,
    kind: 'Order',
    status: item.status,
    to: `/admin/order/${item.id}`
  }))

  const bookingRows = bookings.value.slice(0, 4).map((item) => ({
    id: item.id,
    referenceNo: item.referenceNo,
    customerName: item.customerName,
    kind: 'Booking',
    status: item.status,
    to: `/admin/booking/${item.id}`
  }))

  return [...bookingRows, ...orderRows].slice(0, 6)
})

const statusSummary = computed(() => {
  return [
    { label: 'Order: ใหม่', count: orders.value.filter((item) => item.status === 'ใหม่').length },
    { label: 'Order: กำลังจัดทำ', count: orders.value.filter((item) => item.status === 'กำลังจัดทำ').length },
    { label: 'Booking: รอยืนยัน', count: bookings.value.filter((item) => item.status === 'รอยืนยัน').length },
    { label: 'Booking: แปลงเป็นคำสั่งซื้อแล้ว', count: bookings.value.filter((item) => item.status === 'แปลงเป็นคำสั่งซื้อแล้ว').length }
  ]
})

const quickPages = [
  { to: '/admin/order', title: 'รายการคำสั่งซื้อ', desc: 'ดูงานที่ยืนยันแล้ว' },
  { to: '/admin/booking', title: 'รายการสั่งจองสินค้า', desc: 'ตรวจและยืนยันงานจองใหม่' },
  { to: '/admin/product', title: 'จัดการสินค้า', desc: 'แก้ไขราคาและการเปิดขาย' },
  { to: '/admin/schedule', title: 'ตารางเวลา', desc: 'ดูคิวงานแบบปฏิทิน' }
]
</script>

<style scoped>
.dashboard {
  --brand: #065f46;
  --brand-hover: #064e3b;
  --brand-border: rgba(6, 95, 70, 0.2);
}

.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(6, 95, 70, 0.14);
  box-shadow: 0 8px 22px rgba(6, 95, 70, 0.08);
}

.badge-brand {
  color: var(--brand);
  border: 1px solid rgba(5, 150, 105, 0.24);
  background: rgba(5, 150, 105, 0.12);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(6, 95, 70, 0.14);
  border-radius: 10px;
  padding: 0.5rem 0.7rem;
  background: rgba(255, 255, 255, 0.78);
}

.quick-link {
  border: 1px solid rgba(6, 95, 70, 0.14);
  background: rgba(255, 255, 255, 0.72);
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.quick-link:hover {
  border-color: rgba(5, 150, 105, 0.34);
  transform: translateY(-1px);
}

.link-brand {
  color: var(--brand);
}

.link-brand:hover {
  color: var(--brand-hover);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .panel {
    border-radius: 14px;
  }
}
</style>
