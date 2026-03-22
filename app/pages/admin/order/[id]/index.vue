<template>
  <section class="admin-page space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold tracking-wide text-[#48645d]">Order Detail</p>
          <h1 class="mt-1 text-2xl font-bold text-[#21423b] md:text-3xl">{{ order.referenceNo }}</h1>
          <p class="mt-1 text-sm text-[#4f6660]">{{ order.customerName }} • {{ order.phone }}</p>
        </div>
        <NuxtLink to="/admin/order" class="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold">กลับหน้ารายการคำสั่งซื้อ</NuxtLink>
      </div>
    </header>

    <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <article class="panel rounded-2xl p-5 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-[#21423b]">รายละเอียดคำสั่งซื้อ</h2>
          <p class="mt-1 text-sm text-[#4f6660]">ตรวจสอบและอัปเดตสถานะคำสั่งซื้อจากหน้ารายละเอียด</p>
        </div>

        <dl class="grid gap-2 text-sm text-[#4f6660]">
          <div class="detail-row"><dt>สินค้า</dt><dd>{{ order.itemName }}</dd></div>
          <div class="detail-row"><dt>กำหนดรับสินค้า</dt><dd>{{ order.dueDate }}</dd></div>
          <div class="detail-row"><dt>ยอดเงิน</dt><dd>{{ order.amount.toLocaleString() }} บาท</dd></div>
          <div class="detail-row"><dt>สถานะปัจจุบัน</dt><dd>{{ order.status }}</dd></div>
        </dl>

        <div class="grid gap-3">
          <label class="field-block">
            <span class="field-label">เปลี่ยนสถานะ</span>
            <div class="relative">
              <button type="button" class="field-input field-dropdown-btn" @click.stop="toggleStatusMenu">
                {{ nextStatus }}
              </button>
              <ul v-if="isStatusMenuOpen" class="dropdown dropdown-down dropdown-full menu rounded-xl bg-white shadow-md" @click.stop>
                <li v-for="status in orderStatuses" :key="status">
                  <button type="button" class="dropdown-item" @click="selectStatus(status)">{{ status }}</button>
                </li>
              </ul>
            </div>
          </label>

          <label class="field-block">
            <span class="field-label">หมายเหตุ</span>
            <textarea
              v-model="statusNote"
              rows="3"
              class="field-input resize-none"
              placeholder="เช่น ลูกค้าขอเลื่อนเวลารับสินค้า"
            ></textarea>
          </label>

          <div class="flex flex-wrap gap-2">
            <button class="btn-brand rounded-xl px-4 py-2 text-sm font-semibold" @click="requestStatusSave">บันทึกสถานะ</button>
          </div>

        </div>
      </article>

      <article class="panel rounded-2xl p-5">
        <h2 class="text-lg font-bold text-[#21423b]">ประวัติสถานะ</h2>
        <div class="mt-3 space-y-3">
          <div v-for="item in history" :key="`${item.at}-${item.to}-${item.note}`" class="history-item rounded-xl p-3">
            <p class="text-xs text-[#5a7770]">{{ item.at }} • {{ item.by }}</p>
            <p class="mt-1 text-sm font-semibold text-[#21423b]">{{ item.from }} → {{ item.to }}</p>
            <p class="mt-1 text-sm text-[#4f6660]">{{ item.note }}</p>
          </div>
        </div>
      </article>
    </section>

    <dialog ref="confirmDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold text-[#21423b]">ยืนยันการบันทึกสถานะ</h3>
        <p class="py-3 text-sm text-[#48645d]">ต้องการบันทึกสถานะเป็น {{ nextStatus }} ใช่หรือไม่</p>
        <div class="modal-action">
          <form method="dialog">
            <button type="submit" class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold">ยกเลิก</button>
          </form>
          <button type="button" class="btn-brand rounded-xl px-3 py-2 text-xs font-semibold" @click="executeStatusSave">ยืนยัน</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>

  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAdminMvpStore } from '~/composables/useAdminMvpStore'
import type { AdminOrder } from '~/data/admin-mvp'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { orders, orderHistory, updateOrderStatus } = useAdminMvpStore()
const { showToast } = useAdminToast()

const fallbackOrder: AdminOrder = {
  id: 'fallback-order',
  referenceNo: 'NS-UNKNOWN',
  customerName: 'ไม่พบข้อมูล',
  phone: '-',
  itemName: 'ไม่พบรายการ',
  amount: 0,
  dueDate: '-',
  status: 'ใหม่'
}

const order = computed<AdminOrder>(() => {
  const id = String(route.params.id || '')
  return orders.value.find((item) => item.id === id) || orders.value[0] || fallbackOrder
})

const history = computed(() => orderHistory.value[order.value.id] || [])
const orderStatuses: AdminOrder['status'][] = ['ใหม่', 'กำลังจัดทำ', 'พร้อมรับสินค้า', 'ส่งมอบแล้ว']
const nextStatus = ref<AdminOrder['status']>(order.value.status)
const statusNote = ref('')
const isStatusMenuOpen = ref(false)
const confirmDialog = ref<HTMLDialogElement | null>(null)

watch(order, (value) => {
  nextStatus.value = value.status
  statusNote.value = ''
  isStatusMenuOpen.value = false
})

const toggleStatusMenu = () => {
  isStatusMenuOpen.value = !isStatusMenuOpen.value
}

const selectStatus = (value: AdminOrder['status']) => {
  nextStatus.value = value
  isStatusMenuOpen.value = false
}

const closeMenus = () => {
  isStatusMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', closeMenus)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenus)
})

const requestStatusSave = () => {
  confirmDialog.value?.showModal()
}

const executeStatusSave = () => {
  const changed = updateOrderStatus(
    order.value.id,
    nextStatus.value,
    'Admin',
    statusNote.value.trim() || 'อัปเดตสถานะจากหน้ารายละเอียด'
  )

  confirmDialog.value?.close()
  showToast(changed ? 'success' : 'info', changed ? 'บันทึกสถานะเรียบร้อย' : 'ไม่มีการเปลี่ยนแปลง')
}
</script>

<style scoped>
.admin-page {
  background: radial-gradient(circle at 95% 0%, rgba(6, 95, 70, 0.12), transparent 32%), #f8f5f0;
}

.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(6, 95, 70, 0.14);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #e4eeea;
  padding: 0.55rem 0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row dd {
  font-weight: 700;
  color: #21423b;
}

.history-item {
  border: 1px solid #e4eeea;
  background: rgba(255, 255, 255, 0.82);
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

.dropdown {
  position: absolute;
  right: 0;
  z-index: 20;
  border: 1px solid rgba(6, 95, 70, 0.14);
  padding: 0.35rem;
  list-style: none;
}

.dropdown-down {
  top: calc(100% + 0.35rem);
}

.dropdown-full {
  left: 0;
  right: 0;
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

.btn-brand {
  color: #fff;
  background: linear-gradient(120deg, #0f766e, #065f46);
}

.btn-brand:hover {
  filter: brightness(1.06);
}

.btn-ghost {
  color: #065f46;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.82);
}

.btn-ghost:hover {
  background: #065f46;
  color: #fff;
}

.modal {
  border: none;
  padding: 0;
  background: transparent;
}

.modal::backdrop {
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(1px);
}

.modal-box {
  width: min(92vw, 24rem);
  border-radius: 1rem;
  border: 1px solid rgba(6, 95, 70, 0.16);
  background: #fff;
  padding: 1rem;
}

.modal-action {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
}

.modal-backdrop > button {
  display: none;
}

</style>
