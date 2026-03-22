<template>
    <main class="payment-page min-h-screen px-6 py-8 text-[#1f2f2b] md:py-12">
        <section class="mx-auto max-w-5xl">
            <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Payment</p>
                    <h1 class="font-display mt-1 text-3xl md:text-4xl">แจ้งชำระเงิน</h1>
                    <p class="mt-2 text-sm text-[#4f6660]">เลขอ้างอิง {{ referenceNo }}</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink :to="trackLink" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        ติดตามสถานะ
                    </NuxtLink>
                    <NuxtLink to="/customer" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        หน้าหลัก
                    </NuxtLink>
                </div>
            </div>

            <div v-if="isLoading" class="rounded-2xl border border-[rgba(6,95,70,0.14)] bg-white/75 p-6 text-sm text-[#4f6660]">
                กำลังโหลดข้อมูลการชำระเงิน...
            </div>

            <div v-else-if="loadError" class="rounded-2xl border border-[#f3c6c6] bg-[#fff6f6] p-6 text-sm text-[#9b2c2c]">
                {{ loadError }}
            </div>

            <div v-else class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <article class="card rounded-2xl p-5 md:p-6">
                    <h2 class="font-display text-2xl">สรุปรายการ</h2>
                    <p class="mt-1 text-sm text-[#4f6660]">{{ itemName }}</p>

                    <dl class="mt-5 space-y-3 text-sm text-[#4f6660]">
                        <div class="detail-row">
                            <dt>เลขอ้างอิง</dt>
                            <dd>{{ referenceNo }}</dd>
                        </div>
                        <div class="detail-row">
                            <dt>เบอร์โทร</dt>
                            <dd>{{ displayPhone }}</dd>
                        </div>
                        <div class="detail-row">
                            <dt>ยอดรวมที่ต้องชำระ</dt>
                            <dd class="font-semibold text-[#21423b]">{{ formatCurrency(totalAmount) }}</dd>
                        </div>
                        <div class="detail-row" v-if="latestPayment">
                            <dt>สถานะชำระล่าสุด</dt>
                            <dd>{{ paymentStatusLabel(latestPayment.status) }}</dd>
                        </div>
                    </dl>

                    <div class="mt-5 rounded-xl border border-[rgba(6,95,70,0.14)] bg-white/85 p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a7770]">รายละเอียดสินค้า</p>

                        <div class="mt-3 overflow-x-auto rounded-lg border border-[rgba(6,95,70,0.1)]">
                            <table class="w-full min-w-[420px] text-sm">
                                <thead class="bg-[#f3f8f6] text-[#36524b]">
                                    <tr>
                                        <th class="px-2 py-2 text-left">สินค้า</th>
                                        <th class="px-2 py-2 text-right">จำนวน</th>
                                        <th class="px-2 py-2 text-right">ราคา/หน่วย</th>
                                        <th class="px-2 py-2 text-right">รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in bookingItems" :key="item.id" class="border-t border-[rgba(6,95,70,0.1)]">
                                        <td class="px-2 py-2 text-[#21423b]">
                                            <p class="font-semibold">{{ item.product_name }}</p>
                                            <p v-if="item.note" class="mt-0.5 text-xs text-[#5a7770]">{{ item.note }}</p>
                                        </td>
                                        <td class="px-2 py-2 text-right text-[#21423b]">{{ item.quantity }}</td>
                                        <td class="px-2 py-2 text-right text-[#21423b]">{{ formatCurrency(Number(item.unit_price_at_booking || 0)) }}</td>
                                        <td class="px-2 py-2 text-right font-semibold text-[#21423b]">{{ formatCurrency(Number(item.line_total || 0)) }}</td>
                                    </tr>
                                    <tr v-if="!bookingItems.length" class="border-t border-[rgba(6,95,70,0.1)]">
                                        <td colspan="4" class="px-2 py-3 text-center text-[#4f6660]">ไม่พบรายละเอียดรายการสินค้า</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="mt-4 rounded-xl border border-[rgba(6,95,70,0.14)] bg-white/85 p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a7770]">ข้อมูลผู้จอง</p>
                        <dl class="mt-2 space-y-2 text-sm text-[#4f6660]">
                            <div class="detail-row">
                                <dt>ชื่อผู้จอง</dt>
                                <dd>{{ customerName }}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>เบอร์ติดต่อ</dt>
                                <dd>{{ customerPhone }}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>วันใช้งาน</dt>
                                <dd>{{ usageDate }}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>ที่อยู่จัดส่ง</dt>
                                <dd>{{ deliveryAddress }}</dd>
                            </div>
                        </dl>
                    </div>

                    <div v-if="latestPayment" class="mt-4 rounded-xl border border-[rgba(6,95,70,0.14)] bg-white/85 p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a7770]">ข้อมูลการชำระล่าสุด</p>
                        <dl class="mt-2 space-y-2 text-sm text-[#4f6660]">
                            <div class="detail-row">
                                <dt>ช่องทาง</dt>
                                <dd>{{ paymentChannelLabel(latestPayment.channel) }}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>ยอดชำระ</dt>
                                <dd>{{ formatCurrency(Number(latestPayment.amount || 0)) }}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>มัดจำ</dt>
                                <dd>{{ formatCurrency(Number(latestPayment.deposit_amount || 0)) }}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>วันเวลาชำระ</dt>
                                <dd>{{ formatDate(latestPayment.paid_at) }}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>หมายเหตุ</dt>
                                <dd>{{ latestPayment.note || '-' }}</dd>
                            </div>
                        </dl>
                    </div>

                    <p class="mt-5 text-xs text-[#5a7770]">
                        แนะนำ: โอนเงินแล้วกรอกข้อมูลด้านขวาให้ครบ ระบบจะส่งให้แอดมินตรวจสอบและอัปเดตสถานะ
                    </p>
                </article>

                <form class="card rounded-2xl p-5 md:p-6" @submit.prevent="handleSubmit">
                    <h2 class="font-display text-2xl">ข้อมูลการโอน</h2>
                    <p class="mt-1 text-sm text-[#4f6660]">บันทึกเป็นสถานะรอตรวจสอบ</p>

                    <div class="mt-5 space-y-4">
                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">ช่องทางชำระ</span>
                            <select v-model="paymentForm.channel" class="field">
                                <option value="promptpay">พร้อมเพย์</option>
                                <option value="bank_transfer">โอนบัญชี</option>
                                <option value="cash">เงินสด</option>
                                <option value="credit_card">บัตรเครดิต</option>
                                <option value="other">อื่นๆ</option>
                            </select>
                        </label>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">จำนวนเงิน</span>
                                <input v-model="paymentForm.amount" type="number" min="0" step="0.01" class="field" />
                            </label>

                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">มัดจำ</span>
                                <input v-model="paymentForm.depositAmount" type="number" min="0" step="0.01" class="field" />
                            </label>
                        </div>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">วันเวลาที่ชำระ</span>
                            <input v-model="paymentForm.paidAt" type="datetime-local" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">ลิงก์หลักฐาน (ถ้ามี)</span>
                            <input v-model="paymentForm.proofUrl" type="url" placeholder="https://..." class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">อัปโหลดสลิป (jpg/png/pdf ไม่เกิน 5MB)</span>
                            <input type="file" class="field" accept=".jpg,.jpeg,.png,.pdf" @change="onProofFileChange" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">หมายเหตุ</span>
                            <textarea v-model="paymentForm.note" rows="3" class="field resize-none" placeholder="ชื่อบัญชีผู้โอน / หมายเหตุอื่นๆ"></textarea>
                        </label>
                    </div>

                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="btn-primary mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันแจ้งชำระเงิน' }}
                    </button>

                    <p v-if="submitError" class="mt-3 text-sm text-[#9b2c2c]">{{ submitError }}</p>
                    <p v-if="submitSuccess" class="mt-3 text-sm text-[#166534]">{{ submitSuccess }}</p>
                </form>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { PublicBookingTrackData } from '~/composables/usePublicBookingApi'
import { usePublicBookingApi } from '~/composables/usePublicBookingApi'

type PaymentChannel = 'bank_transfer' | 'promptpay' | 'cash' | 'credit_card' | 'other'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

type BookingSummaryItem = {
    id: string
    product_name: string
    quantity: number
    unit_price_at_booking: number | string
    line_total: number | string
    note?: string | null
}

type PaymentSummaryItem = {
    status: PaymentStatus
    channel: PaymentChannel
    amount: number
    deposit_amount: number
    paid_at?: string | null
    note?: string
}

const route = useRoute()
const {
    trackBooking,
    listBookingItems,
    listPayments,
    submitPublicPayment
} = usePublicBookingApi()

const isLoading = ref(true)
const loadError = ref('')
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

const bookingId = ref('')
const totalAmount = ref(0)
const bookingItems = ref<BookingSummaryItem[]>([])
const paymentEntries = ref<PaymentSummaryItem[]>([])
const bookingTracking = ref<PublicBookingTrackData | null>(null)
const selectedProofFile = ref<File | null>(null)

const referenceNo = computed(() => {
    if (typeof route.query.ref === 'string' && route.query.ref.trim()) return route.query.ref.trim().toUpperCase()
    return 'NS-UNKNOWN'
})

const phone = computed(() => {
    if (typeof route.query.phone === 'string' && route.query.phone.trim()) return route.query.phone.trim()
    return ''
})

const displayPhone = computed(() => phone.value || '-')

const itemName = computed(() => {
    if (typeof route.query.item === 'string' && route.query.item.trim()) return route.query.item.trim()
    return 'รายการจอง/คำสั่งซื้อ'
})

const latestPayment = computed(() => paymentEntries.value[0] || null)
const customerName = computed(() => {
    const first = bookingTracking.value?.delivery_first_name?.trim() || ''
    const last = bookingTracking.value?.delivery_last_name?.trim() || ''
    const fullName = `${first} ${last}`.trim()
    return fullName || 'ไม่ระบุชื่อผู้จอง'
})
const customerPhone = computed(() => bookingTracking.value?.delivery_phone || displayPhone.value || '-')
const usageDate = computed(() => {
    const note = bookingTracking.value?.delivery_note || ''
    if (!note) return '-'

    if (note.startsWith('วันที่ใช้งาน:')) {
        return note.replace('วันที่ใช้งาน:', '').trim() || '-'
    }

    return note
})
const deliveryAddress = computed(() => {
    const no = bookingTracking.value?.delivery_no?.trim() || ''
    const village = bookingTracking.value?.delivery_village?.trim() || ''
    const street = bookingTracking.value?.delivery_street?.trim() || ''
    const text = [no, village, street].filter(Boolean).join(' / ')
    return text || '-'
})

const paymentChannelLabel = (value: PaymentChannel) => {
    if (value === 'promptpay') return 'พร้อมเพย์'
    if (value === 'bank_transfer') return 'โอนบัญชี'
    if (value === 'cash') return 'เงินสด'
    if (value === 'credit_card') return 'บัตรเครดิต'
    return 'อื่นๆ'
}

const trackLink = computed(() => ({
    path: '/customer/track',
    query: {
        ref: referenceNo.value,
        phone: phone.value || undefined
    }
}))

const paymentForm = reactive({
    channel: 'promptpay' as PaymentChannel,
    amount: '',
    depositAmount: '',
    paidAt: '',
    proofUrl: '',
    note: ''
})

const onProofFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0] || null
    selectedProofFile.value = file
}

const toNumber = (value: string) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return 0
    return parsed
}

const formatCurrency = (value: number) => value.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2
})

const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const paymentStatusLabel = (value: PaymentStatus) => {
    if (value === 'pending') return 'รอตรวจสอบ'
    if (value === 'paid') return 'ชำระแล้ว'
    if (value === 'failed') return 'ไม่ผ่านการตรวจสอบ'
    return 'คืนเงินแล้ว'
}

const resolveBookingId = async () => {
    if (typeof route.query.id === 'string' && route.query.id.trim()) {
        bookingId.value = route.query.id.trim()
    } else {
        if (referenceNo.value === 'NS-UNKNOWN' || !phone.value) {
            throw new Error('missing-booking-reference')
        }

        const tracking = await trackBooking(referenceNo.value, phone.value)
        bookingId.value = tracking.id
        bookingTracking.value = tracking
    }

    if (!bookingTracking.value && referenceNo.value !== 'NS-UNKNOWN' && phone.value) {
        try {
            const tracking = await trackBooking(referenceNo.value, phone.value)
            bookingTracking.value = tracking
        } catch {
            bookingTracking.value = null
        }
    }
}

const loadPaymentContext = async () => {
    await resolveBookingId()

    const [items, payments] = await Promise.all([
        listBookingItems(bookingId.value),
        listPayments(bookingId.value)
    ])

    bookingItems.value = items
    totalAmount.value = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0)
    paymentEntries.value = payments.map((item) => ({
        status: item.status,
        channel: item.channel,
        amount: Number(item.amount || 0),
        deposit_amount: Number(item.deposit_amount || 0),
        paid_at: item.paid_at,
        note: item.note || ''
    }))

    const defaultAmount = totalAmount.value > 0 ? totalAmount.value : 0
    paymentForm.amount = String(defaultAmount)
    paymentForm.depositAmount = String(defaultAmount)
}

const handleSubmit = async () => {
    if (!bookingId.value || isSubmitting.value) return

    submitError.value = ''
    submitSuccess.value = ''

    const amount = toNumber(paymentForm.amount)
    const depositAmount = toNumber(paymentForm.depositAmount)

    if (referenceNo.value === 'NS-UNKNOWN' || !phone.value) {
        submitError.value = 'ไม่พบข้อมูลยืนยันการจอง กรุณากลับไปหน้าเลขอ้างอิงแล้วลองใหม่อีกครั้ง'
        return
    }

    if (amount <= 0) {
        submitError.value = 'กรุณาระบุจำนวนเงินมากกว่า 0'
        return
    }

    if (depositAmount < 0 || depositAmount > amount) {
        submitError.value = 'มัดจำต้องอยู่ระหว่าง 0 ถึงจำนวนเงินทั้งหมด'
        return
    }

    isSubmitting.value = true
    try {
        const paidAtValue = paymentForm.paidAt ? new Date(paymentForm.paidAt) : null
        const paidAtISO = paidAtValue && !Number.isNaN(paidAtValue.getTime()) ? paidAtValue.toISOString() : undefined

        await submitPublicPayment({
            bookingNo: referenceNo.value,
            phone: phone.value,
            channel: paymentForm.channel,
            amount,
            depositAmount,
            proofUrl: paymentForm.proofUrl.trim() || undefined,
            note: paymentForm.note.trim() || undefined,
            paidAt: paidAtISO,
            file: selectedProofFile.value || undefined
        })

        await navigateTo(trackLink.value)
    } catch {
        submitError.value = 'ไม่สามารถบันทึกข้อมูลชำระเงินได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    isLoading.value = true
    loadError.value = ''

    try {
        await loadPaymentContext()
    } catch {
        loadError.value = 'ไม่พบข้อมูลการจองสำหรับชำระเงิน กรุณากลับไปหน้าเลขอ้างอิงแล้วลองใหม่อีกครั้ง'
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.payment-page {
    --brand: #065f46;
    --brand-hover: #064e3b;
    --brand-ring: rgba(16, 185, 129, 0.2);
    --brand-border: rgba(6, 95, 70, 0.2);
    --brand-shadow: rgba(6, 95, 70, 0.2);
    background:
        radial-gradient(circle at 90% 5%, rgba(6, 95, 70, 0.12), transparent 30%),
        #f8f5f0;
    font-family: 'Noto Sans Thai', sans-serif;
}

.font-display {
    font-family: 'Pridi', serif;
}

.card {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(6, 95, 70, 0.14);
    box-shadow: 0 12px 28px rgba(6, 95, 70, 0.08);
}

.detail-row {
    display: grid;
    grid-template-columns: 8.5rem 1fr;
    gap: 0.5rem;
    align-items: start;
}

.btn-primary {
    background: var(--brand);
    color: #fff;
    border: 1px solid transparent;
    box-shadow: 0 10px 24px var(--brand-shadow);
}

.btn-primary:hover {
    background: var(--brand-hover);
}

.btn-primary:focus-visible,
.btn-ghost:focus-visible,
.field:focus {
    outline: none;
    box-shadow: 0 0 0 4px var(--brand-ring);
}

.btn-ghost {
    background: rgba(255, 255, 255, 0.82);
    color: var(--brand);
    border: 1px solid var(--brand-border);
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn-ghost:hover {
    background: var(--brand);
    color: #fff;
    border-color: var(--brand);
}

.field {
    width: 100%;
    border-radius: 12px;
    border: 1px solid var(--brand-border);
    background: rgba(255, 255, 255, 0.9);
    padding: 0.72rem 0.85rem;
    font-size: 0.95rem;
    color: #1f2f2b;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field:focus {
    border-color: var(--brand);
}

select.field {
    appearance: none;
    background-image:
        linear-gradient(45deg, transparent 50%, #4f6660 50%),
        linear-gradient(135deg, #4f6660 50%, transparent 50%);
    background-position:
        calc(100% - 16px) calc(50% - 3px),
        calc(100% - 11px) calc(50% - 3px);
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    padding-right: 2.1rem;
}
</style>
