<template>
  <section class="admin-page space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold tracking-wide text-[#48645d]">Booking Management</p>
          <h1 class="mt-1 text-2xl font-bold text-[#21423b] md:text-3xl">รายการจองงานสั่งทำ</h1>
        </div>
      </div>
    </header>

    <section class="panel rounded-2xl p-5 md:p-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <label class="field-block min-w-[220px]">
          <span class="field-label">กรองสถานะ</span>
          <div class="relative">
            <button type="button" class="field-input field-dropdown-btn" @click.stop="toggleFilterMenu">
              {{ statusFilterLabel }}
            </button>
            <ul v-if="isFilterMenuOpen" class="dropdown dropdown-down dropdown-full menu rounded-xl bg-white shadow-md" @click.stop>
              <li>
                <button type="button" class="dropdown-item" @click="selectFilter('all')">ทั้งหมด</button>
              </li>
              <li v-for="status in statusOptions" :key="status.value">
                <button type="button" class="dropdown-item" @click="selectFilter(status.value)">{{ status.label }}</button>
              </li>
            </ul>
          </div>
        </label>
        <span class="text-xs text-[#5f7871]">แสดง {{ filteredBookings.length }} รายการ</span>
      </div>
    </section>

    <section v-if="isLoading" class="panel rounded-2xl p-4 text-sm font-semibold text-[#48645d]">
      กำลังโหลดรายการจอง...
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in filteredBookings" :key="item.id" class="panel rounded-2xl p-4">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold tracking-wide text-[#5a7770]">{{ item.referenceNo }}</p>
            <h2 class="mt-1 text-lg font-bold text-[#21423b]">{{ item.customerName }}</h2>
          </div>
          <span class="badge-brand rounded-full px-3 py-1 text-xs font-semibold">{{ item.statusLabel }}</span>
        </div>

        <dl class="grid gap-2 text-sm text-[#4f6660]">
          <div class="flex items-center justify-between gap-2">
            <dt>แพ็กเกจ</dt>
            <dd class="font-semibold text-[#21423b]">{{ item.packageName }}</dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt>วันใช้งาน</dt>
            <dd class="font-semibold text-[#21423b]">{{ item.eventDate }}</dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt>งบประมาณ</dt>
            <dd class="font-semibold text-[#21423b]">{{ item.budget }}</dd>
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
                {{ statusLabelByValue(statusDrafts[item.id] || item.statusValue) }}
              </button>
              <ul v-if="openStatusMenuId === item.id" class="dropdown dropdown-down dropdown-full menu rounded-xl bg-white shadow-md" @click.stop>
                <li v-for="status in statusOptions" :key="status.value">
                  <button type="button" class="dropdown-item" @click="selectStatus(item.id, status.value)">{{ status.label }}</button>
                </li>
              </ul>
            </div>
          </label>
          <button
            class="btn-brand rounded-xl px-3 py-2 text-xs font-semibold"
            :disabled="isSavingStatus[item.id] || !statusDrafts[item.id] || statusDrafts[item.id] === item.statusValue"
            @click="handleSaveStatus(item.id)"
          >
            {{ isSavingStatus[item.id] ? 'กำลังบันทึก...' : 'บันทึกสถานะ' }}
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
          <NuxtLink :to="`/admin/booking/${item.id}`" class="link-brand text-sm font-semibold">รายละเอียดการจอง</NuxtLink>
          <div class="relative">
            <button type="button" class="btn-menu rounded-xl px-3 py-2 text-xs font-semibold" @click.stop="toggleMenu(item.id)">
              เมนูจัดการ
            </button>
            <ul v-if="openMenuId === item.id" class="dropdown menu w-48 rounded-xl bg-white shadow-md" @click.stop>
              <li>
                <NuxtLink :to="`/admin/booking/${item.id}`" class="dropdown-item">รายละเอียด</NuxtLink>
              </li>
              <li>
                <button
                  type="button"
                  class="dropdown-item"
                  :disabled="Boolean(isConvertingBooking[item.id])"
                  @click="requestConvert(item.id); closeMenu()"
                >
                  {{ isConvertingBooking[item.id] ? 'กำลังแปลง...' : 'ยืนยันเป็นคำสั่งซื้อ' }}
                </button>
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

definePageMeta({
  layout: 'admin'
})

type BookingStatus = 'pending' | 'processing' | 'completed' | 'canceled'

type BookingApiItem = {
  id: string
  booking_no: string
  status: BookingStatus
  created_at: string
}

type BookingDetailApiItem = {
  booking_id: string
  first_name: string
  last_name?: string | null
  phone: string
}

type BookingItemApiItem = {
  booking_id: string
  product_name: string
  line_total: number | string
}

type BookingViewItem = {
  id: string
  referenceNo: string
  customerName: string
  phone: string
  packageName: string
  eventDate: string
  budget: string
  statusValue: BookingStatus
  statusLabel: string
}

type ConvertToOrderResponse = {
  order_id: string
  order_no: string
}

const { request, backofficeRequest } = useAdminApi()
const { showToast } = useAdminToast()

const statusOptions: Array<{ value: BookingStatus, label: string }> = [
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'processing', label: 'กำลังเตรียมงาน' },
  { value: 'completed', label: 'ส่งมอบแล้ว' },
  { value: 'canceled', label: 'ยกเลิกแล้ว' }
]
const statusLabelMap: Record<BookingStatus, string> = {
  pending: 'รอยืนยัน',
  processing: 'กำลังเตรียมงาน',
  completed: 'ส่งมอบแล้ว',
  canceled: 'ยกเลิกแล้ว'
}

const bookings = ref<BookingViewItem[]>([])
const isLoading = ref(false)
const loadNonce = ref(0)
const isSavingStatus = reactive<Record<string, boolean>>({})
const isConvertingBooking = reactive<Record<string, boolean>>({})
const statusFilter = ref<'all' | BookingStatus>('all')
const statusDrafts = reactive<Record<string, BookingStatus>>({})
const openMenuId = ref<string | null>(null)
const openStatusMenuId = ref<string | null>(null)
const isFilterMenuOpen = ref(false)

const statusLabelByValue = (status: BookingStatus) => statusLabelMap[status] || status

const statusFilterLabel = computed(() => {
  if (statusFilter.value === 'all') return 'ทั้งหมด'
  return statusLabelByValue(statusFilter.value)
})

const filteredBookings = computed(() => {
  return bookings.value
})

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date)
}

const formatCurrency = (value: number) => {
  return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)} บาท`
}

const toNumber = (value: number | string) => {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapCustomerName = (detail?: BookingDetailApiItem) => {
  if (!detail) return 'ไม่ระบุชื่อ'
  return [detail.first_name, detail.last_name || ''].join(' ').trim() || 'ไม่ระบุชื่อ'
}

const mapPackageName = (items: BookingItemApiItem[]) => {
  if (!items.length) return '-'
  const names = [...new Set(items.map((item) => item.product_name).filter(Boolean))]
  if (!names.length) return '-'
  const firstName = names[0] || '-'
  if (names.length === 1) return firstName
  return `${firstName} +${names.length - 1} รายการ`
}

const loadBookings = async () => {
  const requestNonce = Date.now()
  loadNonce.value = requestNonce
  isLoading.value = true

  try {
    const statusQuery = statusFilter.value === 'all' ? undefined : statusFilter.value
    const rawBookings = await backofficeRequest<BookingApiItem[]>('/bookings', {
      method: 'GET',
      query: {
        status: statusQuery
      }
    })

    const mapped = await Promise.all((rawBookings || []).map(async (booking) => {
      const [details, items] = await Promise.all([
        request<BookingDetailApiItem[]>('/api/v1/system/booking-details', {
          method: 'GET',
          query: {
            booking_id: booking.id
          }
        }),
        request<BookingItemApiItem[]>('/api/v1/system/booking-items', {
          method: 'GET',
          query: {
            booking_id: booking.id
          }
        })
      ])

      const detail = (details || [])[0]
      const bookingItems = items || []
      const total = bookingItems.reduce((sum, item) => sum + toNumber(item.line_total), 0)

      return {
        id: booking.id,
        referenceNo: booking.booking_no,
        customerName: mapCustomerName(detail),
        phone: detail?.phone || '-',
        packageName: mapPackageName(bookingItems),
        eventDate: formatDate(booking.created_at),
        budget: total > 0 ? formatCurrency(total) : '-',
        statusValue: booking.status,
        statusLabel: statusLabelByValue(booking.status)
      }
    }))

    if (loadNonce.value !== requestNonce) return
    bookings.value = mapped
  } catch {
    if (loadNonce.value !== requestNonce) return
    bookings.value = []
    showToast('warning', 'โหลดรายการจองไม่สำเร็จ')
  } finally {
    if (loadNonce.value === requestNonce) {
      isLoading.value = false
    }
  }
}

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

const selectFilter = (value: 'all' | BookingStatus) => {
  statusFilter.value = value
  isFilterMenuOpen.value = false
}

const toggleStatusMenu = (id: string) => {
  openStatusMenuId.value = openStatusMenuId.value === id ? null : id
}

const selectStatus = (id: string, status: BookingStatus) => {
  statusDrafts[id] = status
  openStatusMenuId.value = null
}

const requestConvert = async (id: string) => {
  if (isConvertingBooking[id]) return

  isConvertingBooking[id] = true
  try {
    const result = await backofficeRequest<ConvertToOrderResponse>(`/bookings/${id}/convert-to-order`, {
      method: 'POST',
      body: {
        reason: 'แปลงจากหน้ารายการจอง'
      }
    })

    showToast('success', `แปลงเป็นคำสั่งซื้อเรียบร้อย (${result.order_no})`)
    await navigateTo('/admin/order')
  } catch {
    showToast('warning', 'ไม่สามารถแปลงเป็นคำสั่งซื้อได้')
  } finally {
    isConvertingBooking[id] = false
  }
}

const handleSaveStatus = async (id: string) => {
  const draft = statusDrafts[id]
  if (!draft) return
  const source = bookings.value.find((item) => item.id === id)
  if (!source || source.statusValue === draft) {
    showToast('info', 'ไม่มีการเปลี่ยนแปลง')
    return
  }

  isSavingStatus[id] = true
  try {
    await backofficeRequest<null>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: {
        status: draft,
        reason: 'อัปเดตสถานะจากหน้ารายการจอง'
      }
    })

    source.statusValue = draft
    source.statusLabel = statusLabelByValue(draft)
    await loadBookings()
    showToast('success', 'บันทึกสถานะเรียบร้อย')
  } catch {
    showToast('warning', 'บันทึกสถานะไม่สำเร็จ')
  } finally {
    isSavingStatus[id] = false
  }
}

watch(
  bookings,
  (items) => {
    for (const item of items) {
      statusDrafts[item.id] = item.statusValue
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

watch(statusFilter, () => {
  loadBookings()
}, { immediate: true })
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

.btn-ghost {
  color: #065f46;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.86);
}

.btn-ghost:hover {
  background: #065f46;
  color: #fff;
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

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
