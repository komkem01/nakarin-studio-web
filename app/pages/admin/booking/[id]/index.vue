<template>
  <section class="admin-page space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold tracking-wide text-[#48645d]">Booking Detail</p>
          <h1 class="mt-1 text-2xl font-bold text-[#21423b] md:text-3xl">{{ booking.referenceNo }}</h1>
          <p class="mt-1 text-sm text-[#4f6660]">{{ booking.customerName }} • {{ booking.phone }}</p>
        </div>
        <NuxtLink to="/admin/booking" class="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold">กลับหน้ารายการจอง</NuxtLink>
      </div>
    </header>

    <section v-if="isLoadingData" class="panel rounded-2xl p-4 text-sm font-semibold text-[#48645d]">
      กำลังโหลดข้อมูลรายละเอียดการจอง...
    </section>

    <section v-else-if="loadError" class="panel rounded-2xl p-4 text-sm font-semibold text-[#9f1239]">
      {{ loadError }}
    </section>

    <section v-else class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <article class="panel rounded-2xl p-5 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-[#21423b]">รายละเอียดการจอง</h2>
          <p class="mt-1 text-sm text-[#4f6660]">ตรวจสอบและอัปเดตสถานะการจองจากหน้ารายละเอียด</p>
        </div>

        <dl class="grid gap-2 text-sm text-[#4f6660]">
          <div class="detail-row"><dt>แพ็กเกจ</dt><dd>{{ booking.packageName }}</dd></div>
          <div class="detail-row"><dt>วันที่สร้างรายการจอง</dt><dd>{{ booking.eventDate }}</dd></div>
          <div class="detail-row"><dt>งบประมาณ</dt><dd>{{ booking.budget }}</dd></div>
          <div class="detail-row"><dt>สถานะปัจจุบัน</dt><dd>{{ booking.statusLabel }}</dd></div>
        </dl>

        <div class="grid gap-3">
          <label class="field-block">
            <span class="field-label">เปลี่ยนสถานะ</span>
            <div class="relative">
              <button type="button" class="field-input field-dropdown-btn" @click.stop="toggleStatusMenu">
                {{ statusLabelByValue(nextStatus) }}
              </button>
              <ul v-if="isStatusMenuOpen" class="dropdown dropdown-down dropdown-full menu rounded-xl bg-white shadow-md" @click.stop>
                <li v-for="status in selectableStatusOptions" :key="status.value">
                  <button type="button" class="dropdown-item" @click="selectStatus(status.value)">{{ status.label }}</button>
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
              placeholder="เช่น รอลูกค้ายืนยันสถานที่"
            ></textarea>
          </label>

          <div class="rounded-xl border border-[rgba(6,95,70,0.16)] bg-white/75 p-3 text-sm text-[#36524b]">
            <p class="text-xs font-semibold uppercase tracking-wide text-[#5a7770]">หมายเหตุจากลูกค้า</p>
            <p class="mt-1 whitespace-pre-line">{{ customerNoteText }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn-brand rounded-xl px-4 py-2 text-sm font-semibold" :disabled="isSavingStatus || !canSaveCurrentStatus" @click="requestStatusSave">
              {{ isSavingStatus ? 'กำลังบันทึก...' : 'บันทึกสถานะ' }}
            </button>
            <button
              class="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold"
              :disabled="isConvertingOrder || !canConvertCurrentBooking"
              @click="requestConvertToOrder"
            >
              {{ isConvertingOrder ? 'กำลังแปลง...' : 'ยืนยันและสร้างคำสั่งซื้อ' }}
            </button>
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

    <section v-if="!isLoadingData && !loadError" class="grid gap-4 lg:grid-cols-2">
      <article class="panel rounded-2xl p-5 space-y-3">
        <h2 class="text-lg font-bold text-[#21423b]">ข้อมูลลูกค้าที่กรอก</h2>
        <dl class="grid gap-2 text-sm text-[#4f6660]">
          <div class="detail-row"><dt>ชื่อผู้จอง</dt><dd>{{ booking.customerName }}</dd></div>
          <div class="detail-row"><dt>เบอร์โทร</dt><dd>{{ booking.phone }}</dd></div>
          <div class="detail-row"><dt>วันที่ใช้งาน</dt><dd>{{ customerEventDate }}</dd></div>
          <div class="detail-row"><dt>หมายเหตุฝั่งลูกค้า</dt><dd class="text-right">{{ customerNoteText }}</dd></div>
        </dl>

        <div class="rounded-xl border border-[rgba(6,95,70,0.16)] bg-white/80 p-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#5a7770]">ข้อมูลเสริมที่ลูกค้ากรอก</p>
          <ul class="mt-2 space-y-1 text-sm text-[#36524b]">
            <li v-for="(line, index) in customerInputLines" :key="`customer-input-${index}`">{{ line }}</li>
            <li v-if="!customerInputLines.length">-</li>
          </ul>
        </div>
      </article>

      <article class="panel rounded-2xl p-5 space-y-3">
        <h2 class="text-lg font-bold text-[#21423b]">ที่อยู่และข้อมูลจัดส่ง</h2>
        <dl class="grid gap-2 text-sm text-[#4f6660]">
          <div class="detail-row"><dt>ชื่อผู้รับ</dt><dd>{{ deliveryRecipientName }}</dd></div>
          <div class="detail-row"><dt>โทรศัพท์ผู้รับ</dt><dd>{{ bookingData?.delivery_phone || '-' }}</dd></div>
          <div class="detail-row"><dt>บ้านเลขที่/หมู่บ้าน</dt><dd>{{ deliveryHouseText }}</dd></div>
          <div class="detail-row"><dt>ถนน</dt><dd>{{ bookingData?.delivery_street || '-' }}</dd></div>
          <div class="detail-row"><dt>ตำบล/อำเภอ/จังหวัด</dt><dd>{{ deliveryAreaText }}</dd></div>
          <div class="detail-row"><dt>รหัสไปรษณีย์</dt><dd>{{ deliveryZipcodeText }}</dd></div>
        </dl>
      </article>
    </section>

    <section v-if="!isLoadingData && !loadError" class="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <article class="panel rounded-2xl p-5 space-y-3">
        <h2 class="text-lg font-bold text-[#21423b]">รายการสินค้าที่จอง</h2>
        <div class="overflow-x-auto rounded-xl border border-[rgba(6,95,70,0.14)]">
          <table class="w-full min-w-[600px] table-fixed text-sm">
            <thead>
              <tr class="bg-[#eff6f3] text-left text-[#36524b]">
                <th class="px-3 py-2">สินค้า</th>
                <th class="px-3 py-2">จำนวน</th>
                <th class="px-3 py-2">ราคา/หน่วย</th>
                <th class="px-3 py-2">รวม</th>
                <th class="px-3 py-2">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in bookingItems" :key="item.id" class="border-t border-[#e4eeea] text-[#21423b]">
                <td class="px-3 py-2 font-semibold">{{ item.product_name }}</td>
                <td class="px-3 py-2">{{ item.quantity }}</td>
                <td class="px-3 py-2">{{ formatCurrency(toNumber(item.unit_price_at_booking)) }}</td>
                <td class="px-3 py-2">{{ formatCurrency(toNumber(item.line_total)) }}</td>
                <td class="px-3 py-2">{{ item.note || '-' }}</td>
              </tr>
              <tr v-if="!bookingItems.length" class="border-t border-[#e4eeea] text-[#4f6660]">
                <td colspan="5" class="px-3 py-3 text-center">ไม่พบรายการสินค้า</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="panel rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-lg font-bold text-[#21423b]">ข้อมูลการชำระเงิน</h2>
          <span
            v-if="paymentStatusBadgeText"
            class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide"
            :class="paymentStatusBadgeClass"
          >
            {{ paymentStatusBadgeText }}
          </span>
        </div>
        <dl class="grid gap-2 text-sm text-[#4f6660]">
          <div class="detail-row"><dt>ยอดรวมรายการจอง</dt><dd>{{ formatCurrency(bookingTotalAmount) }}</dd></div>
          <div class="detail-row"><dt>ช่องทางชำระเงิน</dt><dd>{{ paymentChannelLabel }}</dd></div>
          <div class="detail-row"><dt>สถานะการชำระเงิน</dt><dd>{{ paymentStatusLabel }}</dd></div>
          <div class="detail-row"><dt>จำนวนเงิน</dt><dd>{{ paymentAmountLabel }}</dd></div>
          <div class="detail-row"><dt>มัดจำ</dt><dd>{{ paymentDepositLabel }}</dd></div>
          <div class="detail-row"><dt>วันที่ชำระ</dt><dd>{{ paymentPaidAtLabel }}</dd></div>
          <div class="detail-row"><dt>หมายเหตุการชำระเงิน</dt><dd>{{ paymentNoteLabel }}</dd></div>
          <div class="detail-row">
            <dt>หลักฐานการชำระ</dt>
            <dd>
              <button
                v-if="paymentPrimary"
                type="button"
                class="link-brand font-semibold"
                :disabled="isOpeningProof"
                @click="openPaymentProof"
              >
                {{ isOpeningProof ? 'กำลังเปิด...' : 'เปิดหลักฐาน' }}
              </button>
              <span v-else>-</span>
            </dd>
          </div>
        </dl>

        <div class="space-y-2 rounded-xl border border-[rgba(6,95,70,0.16)] bg-white/75 p-3">
          <template v-if="canReviewPayment">
            <label class="field-block">
              <span class="field-label">หมายเหตุการตรวจสอบชำระเงิน</span>
              <textarea
                v-model="paymentActionNote"
                rows="2"
                class="field-input resize-none"
                placeholder="เช่น สลิปชัดเจน ยอดตรงตามรายการ"
              ></textarea>
            </label>

            <div class="flex flex-wrap gap-2">
              <button
                class="btn-brand rounded-xl px-3 py-2 text-xs font-semibold"
                :disabled="!canReviewPayment || isUpdatingPaymentStatus"
                @click="approvePayment"
              >
                {{ isUpdatingPaymentStatus ? 'กำลังบันทึก...' : 'อนุมัติการชำระ' }}
              </button>
              <button
                class="btn-danger rounded-xl px-3 py-2 text-xs font-semibold"
                :disabled="!canReviewPayment || isUpdatingPaymentStatus"
                @click="rejectPayment"
              >
                {{ isUpdatingPaymentStatus ? 'กำลังบันทึก...' : 'ไม่อนุมัติการชำระ' }}
              </button>
            </div>
          </template>
          <p v-else class="text-xs font-semibold text-[#48645d]">รายการนี้ตรวจสอบการชำระเงินแล้ว ไม่ต้องอนุมัติซ้ำ</p>
        </div>
      </article>
    </section>

    <div
      v-if="isConfirmModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      @click.self="clearPendingAction"
    >
      <div class="w-full max-w-md rounded-2xl border border-[rgba(6,95,70,0.16)] bg-white p-5 shadow-xl">
        <h3 class="text-lg font-bold text-[#21423b]">{{ confirmTitle }}</h3>
        <p class="py-3 text-sm text-[#48645d]">{{ confirmMessage }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold" @click="clearPendingAction">ยกเลิก</button>
          <button type="button" class="btn-brand rounded-xl px-3 py-2 text-xs font-semibold" @click="executePendingAction">ยืนยัน</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

definePageMeta({
  layout: 'admin'
})

type BookingStatus = 'pending' | 'processing' | 'completed' | 'canceled'

type BookingApiItem = {
  id: string
  booking_no: string
  status: BookingStatus
  payment: 'deposit' | 'paid'
  cancelled_reason?: string | null
  internal_note?: string | null
  tracking_attempt_count: number
  last_tracking_at?: string | null
  delivery_first_name?: string | null
  delivery_last_name?: string | null
  delivery_phone?: string | null
  delivery_no?: string | null
  delivery_village?: string | null
  delivery_street?: string | null
  delivery_province_id?: string | null
  delivery_district_id?: string | null
  delivery_sub_district_id?: string | null
  delivery_zipcode_id?: string | null
  delivery_note?: string | null
  created_at: string
  updated_at: string
}

type BookingDetailApiItem = {
  booking_id: string
  first_name: string
  last_name?: string | null
  phone: string
}

type BookingItemApiItem = {
  id: string
  booking_id: string
  product_name: string
  unit_price_at_booking: number | string
  quantity: number
  line_total: number | string
  note?: string | null
}

type PaymentApiItem = {
  id: string
  booking_id: string
  channel: string
  amount: number | string
  deposit_amount: number | string
  status: string
  note?: string | null
  paid_at?: string | null
}

type AreaApiItem = {
  id: string
  name: string
}

type BookingStatusLogApiItem = {
  from_status?: BookingStatus | null
  to_status: BookingStatus
  changed_by_role?: 'admin' | 'customer' | null
  reason?: string | null
  changed_at: string
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

type BookingHistoryViewItem = {
  at: string
  by: string
  from: string
  to: string
  note: string
}

type ConvertToOrderResponse = {
  order_id: string
  order_no: string
}

const route = useRoute()
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

const bookingId = computed(() => String(route.params.id || ''))
const bookingData = ref<BookingApiItem | null>(null)
const bookingDetail = ref<BookingDetailApiItem | null>(null)
const bookingItems = ref<BookingItemApiItem[]>([])
const bookingLogs = ref<BookingStatusLogApiItem[]>([])
const paymentEntries = ref<PaymentApiItem[]>([])
const provinceName = ref('')
const districtName = ref('')
const subDistrictName = ref('')
const zipcodeName = ref('')
const isLoadingData = ref(false)
const loadError = ref('')
const isSavingStatus = ref(false)
const isConvertingOrder = ref(false)
const isUpdatingPaymentStatus = ref(false)
const isOpeningProof = ref(false)
const paymentActionNote = ref('')

const fallbackBooking: BookingViewItem = {
  id: 'fallback-booking',
  referenceNo: 'NS-UNKNOWN',
  customerName: 'ไม่พบข้อมูล',
  phone: '-',
  packageName: 'ไม่พบรายการ',
  eventDate: '-',
  budget: '-',
  statusValue: 'pending',
  statusLabel: 'รอยืนยัน'
}

const statusLabelByValue = (status: BookingStatus) => statusLabelMap[status] || status

const allowedNextStatuses = (from: BookingStatus): BookingStatus[] => {
  if (from === 'pending') return ['pending', 'processing', 'canceled']
  if (from === 'processing') return ['processing', 'completed', 'canceled']
  if (from === 'completed') return ['completed']
  return ['canceled']
}

const selectableStatusOptions = computed(() => {
  const allowed = new Set(allowedNextStatuses(booking.value.statusValue))
  return statusOptions.filter((item) => allowed.has(item.value))
})

const canConvertCurrentBooking = computed(() => booking.value.statusValue !== 'canceled')
const canSaveCurrentStatus = computed(() => {
  if (!bookingData.value) return false
  if (bookingData.value.status === nextStatus.value) return false
  return allowedNextStatuses(bookingData.value.status).includes(nextStatus.value)
})

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const formatCurrency = (value: number) => {
  return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)} บาท`
}

const toNumber = (value: number | string) => {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const booking = computed<BookingViewItem>(() => {
  if (!bookingData.value) return fallbackBooking

  const total = bookingItems.value.reduce((sum, item) => sum + toNumber(item.line_total), 0)
  const names = [...new Set(bookingItems.value.map((item) => item.product_name).filter(Boolean))]
  const firstName = names[0] || '-'
  const packageName = names.length <= 1 ? firstName : `${firstName} +${names.length - 1} รายการ`
  const customerName = bookingDetail.value
    ? [bookingDetail.value.first_name, bookingDetail.value.last_name || ''].join(' ').trim() || 'ไม่ระบุชื่อ'
    : 'ไม่ระบุชื่อ'

  return {
    id: bookingData.value.id,
    referenceNo: bookingData.value.booking_no,
    customerName,
    phone: bookingDetail.value?.phone || '-',
    packageName,
    eventDate: formatDate(bookingData.value.created_at),
    budget: total > 0 ? formatCurrency(total) : '-',
    statusValue: bookingData.value.status,
    statusLabel: statusLabelByValue(bookingData.value.status)
  }
})

const splitPipeText = (value?: string | null) => {
  if (!value) return []
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

const customerInputLines = computed(() => splitPipeText(bookingData.value?.internal_note))
const customerEventDate = computed(() => {
  if (!bookingData.value?.delivery_note) return '-'
  const text = bookingData.value.delivery_note
  return text.startsWith('วันที่ใช้งาน:') ? text.replace('วันที่ใช้งาน:', '').trim() : text
})
const customerNoteText = computed(() => {
  const itemNote = bookingItems.value.find((item) => (item.note || '').trim())?.note
  return itemNote || bookingData.value?.delivery_note || '-'
})

const deliveryRecipientName = computed(() => {
  const first = bookingData.value?.delivery_first_name || ''
  const last = bookingData.value?.delivery_last_name || ''
  const fullName = `${first} ${last}`.trim()
  return fullName || '-'
})
const deliveryHouseText = computed(() => {
  const no = bookingData.value?.delivery_no || ''
  const village = bookingData.value?.delivery_village || ''
  const text = [no, village].filter(Boolean).join(' / ')
  return text || '-'
})
const deliveryAreaText = computed(() => {
  const text = [subDistrictName.value, districtName.value, provinceName.value].filter(Boolean).join(' / ')
  return text || '-'
})
const deliveryZipcodeText = computed(() => zipcodeName.value || '-')

const bookingTotalAmount = computed(() => bookingItems.value.reduce((sum, item) => sum + toNumber(item.line_total), 0))
const paymentPrimary = computed(() => paymentEntries.value[0] || null)
const paymentChannelLabel = computed(() => {
  const channel = paymentPrimary.value?.channel
  if (!channel) return '-'
  if (channel === 'bank_transfer') return 'โอนบัญชี'
  if (channel === 'promptpay') return 'พร้อมเพย์'
  if (channel === 'credit_card') return 'บัตรเครดิต'
  if (channel === 'cash') return 'เงินสด'
  return 'อื่นๆ'
})
const paymentStatusLabel = computed(() => {
  const status = paymentPrimary.value?.status
  if (!status) return '-'
  if (status === 'pending') return 'รอตรวจสอบ'
  if (status === 'paid') return 'ชำระแล้ว'
  if (status === 'failed') return 'ไม่อนุมัติ'
  if (status === 'refunded') return 'คืนเงินแล้ว'
  return status
})
const paymentAmountLabel = computed(() => {
  if (!paymentPrimary.value) return '-'
  return formatCurrency(toNumber(paymentPrimary.value.amount))
})
const paymentDepositLabel = computed(() => {
  if (!paymentPrimary.value) return '-'
  return formatCurrency(toNumber(paymentPrimary.value.deposit_amount))
})
const paymentPaidAtLabel = computed(() => formatDate(paymentPrimary.value?.paid_at))
const paymentNoteLabel = computed(() => paymentPrimary.value?.note || '-')
const paymentProofUrl = computed(() => paymentPrimary.value?.proof_url || '')
const canReviewPayment = computed(() => paymentPrimary.value?.status === 'pending')
const paymentStatusBadgeText = computed(() => {
  const status = paymentPrimary.value?.status
  if (status === 'paid') return 'อนุมัติแล้วจากคิวตรวจสอบ'
  if (status === 'failed') return 'ไม่อนุมัติจากคิวตรวจสอบ'
  if (status === 'refunded') return 'คืนเงินแล้ว'
  return ''
})
const paymentStatusBadgeClass = computed(() => {
  const status = paymentPrimary.value?.status
  if (status === 'paid') {
    return 'border border-[rgba(6,95,70,0.22)] bg-[rgba(6,95,70,0.1)] text-[#065f46]'
  }
  if (status === 'failed') {
    return 'border border-[rgba(159,18,57,0.22)] bg-[rgba(159,18,57,0.1)] text-[#9f1239]'
  }
  if (status === 'refunded') {
    return 'border border-[rgba(59,130,246,0.22)] bg-[rgba(59,130,246,0.1)] text-[#1d4ed8]'
  }
  return 'border border-[rgba(6,95,70,0.14)] bg-[rgba(6,95,70,0.08)] text-[#48645d]'
})

const history = computed<BookingHistoryViewItem[]>(() => {
  return bookingLogs.value.map((item) => ({
    at: formatDate(item.changed_at),
    by: item.changed_by_role === 'admin' ? 'แอดมิน' : item.changed_by_role === 'customer' ? 'ลูกค้า' : 'ระบบ',
    from: item.from_status ? statusLabelByValue(item.from_status) : 'เริ่มต้น',
    to: statusLabelByValue(item.to_status),
    note: item.reason || '-'
  }))
})

const nextStatus = ref<BookingStatus>(booking.value.statusValue)
const statusNote = ref('')
const isStatusMenuOpen = ref(false)

const pendingAction = ref<'status' | 'convert' | null>(null)
const isConfirmModalOpen = ref(false)

const confirmTitle = computed(() => {
  return pendingAction.value === 'convert' ? 'ยืนยันการแปลงเป็นคำสั่งซื้อ' : 'ยืนยันการบันทึกสถานะ'
})

const confirmMessage = computed(() => {
  if (pendingAction.value === 'convert') {
    return `ต้องการแปลงรายการ ${booking.value.referenceNo} เป็นคำสั่งซื้อหรือไม่`
  }

  return `ต้องการบันทึกสถานะเป็น ${statusLabelByValue(nextStatus.value)} ใช่หรือไม่`
})

watch(booking, (value) => {
  nextStatus.value = value.statusValue
  statusNote.value = ''
  isStatusMenuOpen.value = false
})

watch(paymentPrimary, () => {
  paymentActionNote.value = ''
})

const loadBooking = async () => {
  try {
    bookingData.value = await request<BookingApiItem>(`/api/v1/system/bookings/${bookingId.value}`, {
      method: 'GET'
    })
  } catch {
    bookingData.value = null
    showToast('warning', 'โหลดข้อมูลการจองไม่สำเร็จ')
  }
}

const loadBookingDetail = async () => {
  try {
    const details = await request<BookingDetailApiItem[]>('/api/v1/system/booking-details', {
      method: 'GET',
      query: {
        booking_id: bookingId.value
      }
    })
    bookingDetail.value = (details || [])[0] || null
  } catch {
    bookingDetail.value = null
  }
}

const loadBookingItems = async () => {
  try {
    bookingItems.value = await request<BookingItemApiItem[]>('/api/v1/system/booking-items', {
      method: 'GET',
      query: {
        booking_id: bookingId.value
      }
    })
  } catch {
    bookingItems.value = []
  }
}

const loadPayments = async () => {
  try {
    paymentEntries.value = await request<PaymentApiItem[]>('/api/v1/system/payments', {
      method: 'GET',
      query: {
        booking_id: bookingId.value
      }
    })
  } catch {
    paymentEntries.value = []
  }
}

const getAreaName = async (resource: string, id?: string | null) => {
  if (!id) return ''
  try {
    const item = await request<AreaApiItem>(`/api/v1/system/${resource}/${id}`, {
      method: 'GET'
    })
    return item?.name || ''
  } catch {
    return ''
  }
}

const loadAreaNames = async () => {
  provinceName.value = ''
  districtName.value = ''
  subDistrictName.value = ''
  zipcodeName.value = ''

  if (!bookingData.value) return

  const [province, district, subDistrict, zipcode] = await Promise.all([
    getAreaName('provinces', bookingData.value.delivery_province_id),
    getAreaName('districts', bookingData.value.delivery_district_id),
    getAreaName('sub-districts', bookingData.value.delivery_sub_district_id),
    getAreaName('zipcodes', bookingData.value.delivery_zipcode_id)
  ])

  provinceName.value = province
  districtName.value = district
  subDistrictName.value = subDistrict
  zipcodeName.value = zipcode
}

const loadBookingHistory = async () => {
  try {
    bookingLogs.value = await request<BookingStatusLogApiItem[]>('/api/v1/system/booking-status-logs', {
      method: 'GET',
      query: {
        booking_id: bookingId.value
      }
    })
  } catch {
    bookingLogs.value = []
  }
}

const loadPageData = async () => {
  isLoadingData.value = true
  loadError.value = ''
  try {
    await Promise.all([loadBooking(), loadBookingDetail(), loadBookingItems(), loadBookingHistory(), loadPayments()])
    await loadAreaNames()
  } catch {
    loadError.value = 'ไม่สามารถโหลดข้อมูลรายละเอียดการจองได้ในขณะนี้'
  } finally {
    isLoadingData.value = false
  }
}

const toggleStatusMenu = () => {
  isStatusMenuOpen.value = !isStatusMenuOpen.value
}

const selectStatus = (value: BookingStatus) => {
  nextStatus.value = value
  isStatusMenuOpen.value = false
}

const clearPendingAction = () => {
  pendingAction.value = null
  isConfirmModalOpen.value = false
}

const closeMenus = () => {
  isStatusMenuOpen.value = false
}

onMounted(() => {
  loadPageData()
  window.addEventListener('click', closeMenus)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenus)
})

watch(() => route.params.id, () => {
  loadPageData()
})

const requestStatusSave = () => {
  if (!canSaveCurrentStatus.value) return
  pendingAction.value = 'status'
  isConfirmModalOpen.value = true
}

const requestConvertToOrder = () => {
  if (!canConvertCurrentBooking.value) return
  pendingAction.value = 'convert'
  isConfirmModalOpen.value = true
}

const updatePaymentDecision = async (action: 'approve' | 'reject') => {
  if (!paymentPrimary.value || isUpdatingPaymentStatus.value || !canReviewPayment.value) return

  isUpdatingPaymentStatus.value = true
  try {
    await backofficeRequest<null>(`/payments/${paymentPrimary.value.id}/${action}`, {
      method: 'PATCH',
      body: {
        note: paymentActionNote.value.trim() || undefined
      }
    })

    await Promise.all([loadPayments(), loadBooking()])
    paymentActionNote.value = ''
    showToast('success', action === 'approve' ? 'อนุมัติการชำระเงินแล้ว' : 'อัปเดตเป็นไม่อนุมัติแล้ว')
  } catch {
    showToast('warning', 'อัปเดตสถานะการชำระเงินไม่สำเร็จ')
  } finally {
    isUpdatingPaymentStatus.value = false
  }
}

const approvePayment = async () => {
  await updatePaymentDecision('approve')
}

const rejectPayment = async () => {
  await updatePaymentDecision('reject')
}

const openPaymentProof = async () => {
  if (!paymentPrimary.value || isOpeningProof.value) return

  isOpeningProof.value = true
  try {
    const res = await backofficeRequest<{ url: string }>(`/payments/${paymentPrimary.value.id}/proof-url`, {
      method: 'GET'
    })

    if (res?.url && import.meta.client) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
      return
    }

    if (paymentProofUrl.value && import.meta.client) {
      window.open(paymentProofUrl.value, '_blank', 'noopener,noreferrer')
    }
  } catch {
    showToast('warning', 'ไม่สามารถเปิดหลักฐานการชำระได้')
  } finally {
    isOpeningProof.value = false
  }
}

const executePendingAction = async () => {
  const action = pendingAction.value
  pendingAction.value = null
  isConfirmModalOpen.value = false

  if (action === 'status') {
    if (!bookingData.value) {
      showToast('warning', 'ไม่พบข้อมูลการจอง')
      return
    }

    if (bookingData.value.status === nextStatus.value) {
      showToast('info', 'ไม่มีการเปลี่ยนแปลง')
      return
    }
    if (!allowedNextStatuses(bookingData.value.status).includes(nextStatus.value)) {
      showToast('warning', 'ไม่สามารถเปลี่ยนสถานะตามลำดับนี้ได้')
      return
    }

    isSavingStatus.value = true
    try {
      await backofficeRequest<null>(`/bookings/${bookingData.value.id}/status`, {
        method: 'PATCH',
        body: {
          status: nextStatus.value,
          reason: statusNote.value.trim() || 'อัปเดตสถานะจากหน้ารายละเอียด'
        }
      })
      bookingData.value.status = nextStatus.value
      await loadBookingHistory()
      showToast('success', 'บันทึกสถานะเรียบร้อย')
    } catch {
      showToast('warning', 'บันทึกสถานะไม่สำเร็จ')
    } finally {
      isSavingStatus.value = false
    }
    return
  }

  if (action === 'convert') {
    if (!bookingData.value || isConvertingOrder.value || !canConvertCurrentBooking.value) {
      return
    }

    isConvertingOrder.value = true
    try {
      const result = await backofficeRequest<ConvertToOrderResponse>(`/bookings/${bookingData.value.id}/convert-to-order`, {
        method: 'POST',
        body: {
          reason: statusNote.value.trim() || 'แปลงจากหน้ารายละเอียดการจอง'
        }
      })

      showToast('success', `แปลงเป็นคำสั่งซื้อเรียบร้อย (${result.order_no})`)
      await navigateTo('/admin/order')
    } catch {
      showToast('warning', 'ไม่สามารถแปลงเป็นคำสั่งซื้อได้')
    } finally {
      isConvertingOrder.value = false
    }
  }
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

.btn-ghost:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-danger {
  color: #fff;
  background: linear-gradient(120deg, #be123c, #9f1239);
}

.btn-danger:hover {
  filter: brightness(1.05);
}

.link-brand {
  color: #0f766e;
}

.link-brand:hover {
  color: #115e59;
  text-decoration: underline;
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
