<template>
  <section class="admin-page space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <p class="text-sm font-semibold tracking-wide text-[#48645d]">Payment Review Queue</p>
      <h1 class="mt-1 text-2xl font-bold text-[#21423b]">คิวตรวจสอบการชำระเงิน</h1>
      <p class="mt-1 text-sm text-[#4f6660]">แสดงเฉพาะรายการที่สถานะรอตรวจสอบ</p>
    </header>

    <section v-if="isLoading" class="panel rounded-2xl p-4 text-sm font-semibold text-[#48645d]">
      กำลังโหลดคิวตรวจสอบการชำระ...
    </section>

    <section v-else-if="loadError" class="panel rounded-2xl p-4 text-sm font-semibold text-[#9f1239]">
      {{ loadError }}
    </section>

    <section v-else class="panel rounded-2xl p-5">
      <div class="mb-4 flex items-center justify-between gap-2">
        <p class="text-sm text-[#4f6660]">ทั้งหมด {{ queue.length }} รายการ</p>
        <button class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold" :disabled="isLoading" @click="loadQueue">
          รีเฟรช
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-[rgba(6,95,70,0.14)]">
        <table class="w-full min-w-[940px] table-fixed text-sm">
          <thead>
            <tr class="bg-[#eff6f3] text-left text-[#36524b]">
              <th class="px-3 py-2">เลขอ้างอิง</th>
              <th class="px-3 py-2">ลูกค้า</th>
              <th class="px-3 py-2">ช่องทาง</th>
              <th class="px-3 py-2">จำนวนเงิน</th>
              <th class="px-3 py-2">วันที่ชำระ</th>
              <th class="px-3 py-2">หลักฐาน</th>
              <th class="px-3 py-2">ตรวจสอบ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in queue" :key="item.paymentId" class="border-t border-[#e4eeea] text-[#21423b] align-top">
              <td class="px-3 py-2 font-semibold">{{ item.bookingNo }}</td>
              <td class="px-3 py-2">
                <p>{{ item.customerName }}</p>
                <p class="text-xs text-[#5a7770]">{{ item.phone }}</p>
              </td>
              <td class="px-3 py-2">{{ item.channelLabel }}</td>
              <td class="px-3 py-2">{{ formatCurrency(item.amount) }}</td>
              <td class="px-3 py-2">{{ formatDate(item.paidAt) }}</td>
              <td class="px-3 py-2">
                <button
                  v-if="item.proofUrl"
                  type="button"
                  class="link-brand font-semibold"
                  :disabled="Boolean(openingProofMap[item.paymentId])"
                  @click="openProof(item.paymentId, item.proofUrl)"
                >
                  {{ openingProofMap[item.paymentId] ? 'กำลังเปิด...' : 'เปิดหลักฐาน' }}
                </button>
                <span v-else>-</span>
              </td>
              <td class="px-3 py-2">
                <div class="space-y-2">
                  <textarea
                    v-model="notes[item.paymentId]"
                    rows="2"
                    class="field-input w-full resize-none"
                    placeholder="หมายเหตุการตรวจสอบ"
                  ></textarea>
                  <div class="flex flex-wrap gap-2">
                    <button
                      class="btn-brand rounded-xl px-3 py-1.5 text-xs font-semibold"
                      :disabled="Boolean(loadingMap[item.paymentId])"
                      @click="approve(item.paymentId)"
                    >
                      {{ loadingMap[item.paymentId] ? 'กำลังบันทึก...' : 'อนุมัติ' }}
                    </button>
                    <button
                      class="btn-danger rounded-xl px-3 py-1.5 text-xs font-semibold"
                      :disabled="Boolean(loadingMap[item.paymentId])"
                      @click="reject(item.paymentId)"
                    >
                      {{ loadingMap[item.paymentId] ? 'กำลังบันทึก...' : 'ไม่อนุมัติ' }}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!queue.length" class="border-t border-[#e4eeea] text-[#4f6660]">
              <td colspan="7" class="px-3 py-4 text-center">ไม่มีรายการรอตรวจสอบ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

type PaymentItem = {
  payment_id: string
  booking_id: string
  booking_no: string
  customer_name: string
  phone: string
  channel: string
  amount: number | string
  deposit_amount: number | string
  status: string
  proof_url?: string | null
  note?: string | null
  paid_at?: string | null
}

type QueueRow = {
  paymentId: string
  bookingNo: string
  customerName: string
  phone: string
  channelLabel: string
  amount: number
  paidAt?: string | null
  proofUrl?: string | null
}

const { backofficeRequest } = useAdminApi()
const { showToast } = useAdminToast()

const isLoading = ref(false)
const loadError = ref('')
const queue = ref<QueueRow[]>([])
const notes = reactive<Record<string, string>>({})
const loadingMap = reactive<Record<string, boolean>>({})
const openingProofMap = reactive<Record<string, boolean>>({})

const toNumber = (value: number | string) => {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const channelLabel = (value: string) => {
  if (value === 'bank_transfer') return 'โอนบัญชี'
  if (value === 'promptpay') return 'พร้อมเพย์'
  if (value === 'credit_card') return 'บัตรเครดิต'
  if (value === 'cash') return 'เงินสด'
  return 'อื่นๆ'
}

const formatCurrency = (value: number) => {
  return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)} บาท`
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const mapQueueRow = (item: PaymentItem): QueueRow => {
  return {
    paymentId: item.payment_id,
    bookingNo: item.booking_no || '-',
    customerName: item.customer_name || 'ไม่ระบุชื่อ',
    phone: item.phone || '-',
    channelLabel: channelLabel(item.channel),
    amount: toNumber(item.amount),
    paidAt: item.paid_at,
    proofUrl: item.proof_url || null
  }
}

const loadQueue = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const pending = await backofficeRequest<PaymentItem[]>('/payments/pending', {
      method: 'GET'
    })
    queue.value = (pending || []).map((item) => mapQueueRow(item))
  } catch {
    queue.value = []
    loadError.value = 'โหลดคิวตรวจสอบการชำระไม่สำเร็จ'
    showToast('warning', 'โหลดคิวตรวจสอบการชำระไม่สำเร็จ')
  } finally {
    isLoading.value = false
  }
}

const act = async (paymentId: string, action: 'approve' | 'reject') => {
  if (loadingMap[paymentId]) return

  loadingMap[paymentId] = true
  try {
    await backofficeRequest<null>(`/payments/${paymentId}/${action}`, {
      method: 'PATCH',
      body: {
        note: (notes[paymentId] || '').trim() || undefined
      }
    })

    showToast('success', action === 'approve' ? 'อนุมัติการชำระแล้ว' : 'อัปเดตเป็นไม่อนุมัติแล้ว')
    await loadQueue()
  } catch {
    showToast('warning', 'อัปเดตสถานะการชำระไม่สำเร็จ')
  } finally {
    loadingMap[paymentId] = false
  }
}

const approve = async (paymentId: string) => {
  await act(paymentId, 'approve')
}

const reject = async (paymentId: string) => {
  await act(paymentId, 'reject')
}

const openProof = async (paymentId: string, fallbackUrl?: string | null) => {
  if (openingProofMap[paymentId]) return

  openingProofMap[paymentId] = true
  try {
    const res = await backofficeRequest<{ url: string }>(`/payments/${paymentId}/proof-url`, {
      method: 'GET'
    })

    const url = res?.url || fallbackUrl || ''
    if (url && import.meta.client) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    showToast('warning', 'ไม่พบลิงก์หลักฐานการชำระ')
  } catch {
    showToast('warning', 'ไม่สามารถเปิดหลักฐานการชำระได้')
  } finally {
    openingProofMap[paymentId] = false
  }
}

await loadQueue()
</script>

<style scoped>
.admin-page {
  background: radial-gradient(circle at 95% 0%, rgba(6, 95, 70, 0.12), transparent 32%), #f8f5f0;
}

.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(6, 95, 70, 0.14);
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

.btn-danger {
  color: #fff;
  background: linear-gradient(120deg, #be123c, #9f1239);
}

.btn-danger:hover {
  filter: brightness(1.05);
}

.field-input {
  border-radius: 0.65rem;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.96);
  padding: 0.5rem 0.65rem;
  color: #1f3d36;
}

.field-input:focus {
  border-color: rgba(15, 118, 110, 0.6);
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
}

.link-brand {
  color: #0f766e;
}

.link-brand:hover {
  color: #115e59;
  text-decoration: underline;
}
</style>
