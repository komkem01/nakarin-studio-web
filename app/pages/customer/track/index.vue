<template>
    <main class="track-page min-h-screen px-6 py-8 text-[#1f2f2b] md:py-12">
        <section class="mx-auto max-w-5xl">
            <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Track Order</p>
                    <h1 class="font-display mt-1 text-3xl md:text-4xl">ติดตามสถานะการสั่ง/จอง</h1>
                    <p class="mt-2 text-sm text-[#4f6660]">กรอกเลขการจองและเบอร์โทรเพื่อค้นหาสถานะล่าสุด</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink to="/customer/product" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        สินค้า
                    </NuxtLink>
                    <NuxtLink to="/customer" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        หน้าหลัก
                    </NuxtLink>
                </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <form class="card rounded-2xl p-5 md:p-6" @submit.prevent="handleSearch">
                    <h2 class="font-display text-2xl">ค้นหาสถานะ</h2>
                    <p class="mt-1 text-sm text-[#4f6660]">ใช้ข้อมูลจากตอนที่ยืนยันคำสั่งซื้อหรือจองคิว</p>

                    <div class="mt-5 space-y-4">
                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">เลขการจอง/คำสั่งซื้อ</span>
                            <input v-model="searchForm.referenceNo" type="text" placeholder="เช่น NS-250322-1048" class="field uppercase" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">เบอร์โทรศัพท์</span>
                            <input v-model="searchForm.phone" type="tel" placeholder="08x-xxx-xxxx" class="field" />
                        </label>

                    </div>

                    <button type="submit" :disabled="isLocked || isSearching" class="btn-primary mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70">
                        {{ isSearching ? 'กำลังค้นหา...' : 'ค้นหาสถานะ' }}
                    </button>

                    <p v-if="searchResult === 'not-found'" class="mt-3 text-sm text-[#9b2c2c]">
                        ไม่พบข้อมูล กรุณาตรวจสอบเลขอ้างอิงและเบอร์โทรอีกครั้ง
                    </p>

                    <p v-if="isLocked" class="mt-3 text-sm text-[#9b2c2c]">
                        ค้นหาถี่เกินไป กรุณารอ {{ lockRemainingSeconds }} วินาทีก่อนลองใหม่
                    </p>
                </form>

                <section class="card rounded-2xl p-5 md:p-6">
                    <template v-if="selectedRecord">
                        <p class="badge-brand inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                            {{ selectedRecord.type === 'booking' ? 'งานจองคิว' : 'คำสั่งซื้อสินค้า' }}
                        </p>
                        <h3 class="font-display mt-3 text-2xl">{{ selectedRecord.itemName }}</h3>
                        <p class="mt-1 text-sm text-[#4f6660]">เลขอ้างอิง {{ selectedRecord.referenceNo }}</p>

                        <div class="mt-4 rounded-xl border border-[rgba(6,95,70,0.14)] bg-white/85 p-4">
                            <p class="text-sm text-[#4f6660]">สถานะล่าสุด</p>
                            <p class="mt-1 text-base font-semibold text-[#21423b]">{{ selectedRecord.statusLabel }}</p>
                            <p class="mt-1 text-sm text-[#4f6660]">กำหนดการ: {{ selectedRecord.appointmentDate }}</p>
                        </div>

                        <div class="mt-5 space-y-3">
                            <article
                                v-for="step in selectedRecord.timeline"
                                :key="`${step.title}-${step.at}`"
                                class="timeline-item rounded-xl p-3"
                                :class="step.done ? 'done' : 'pending'"
                            >
                                <div class="flex items-start justify-between gap-4">
                                    <p class="text-sm font-semibold">{{ step.title }}</p>
                                    <span class="text-xs text-[#5a7770]">{{ step.at }}</span>
                                </div>
                            </article>
                        </div>

                        <p class="mt-5 text-sm text-[#4f6660]">{{ selectedRecord.note }}</p>
                    </template>
                    <template v-else>
                        <h3 class="font-display text-2xl">ผลการค้นหาจะขึ้นที่นี่</h3>
                        <p class="mt-2 text-sm text-[#4f6660]">
                            กรอกเลขอ้างอิงและเบอร์โทรที่ใช้ตอนยืนยันคำขอ เพื่อค้นหาข้อมูลจริงจากระบบ
                        </p>
                    </template>
                </section>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { normalizePhone } from '~/data/customer-tracking'
import { usePublicBookingApi } from '~/composables/usePublicBookingApi'

const route = useRoute()
const ATTEMPT_WINDOW_MS = 60 * 1000
const MAX_ATTEMPTS_PER_WINDOW = 5
const STORAGE_KEY = 'customer-track-attempts'
const { trackBooking } = usePublicBookingApi()

const searchForm = reactive({
    referenceNo: '',
    phone: ''
})

type TrackViewRecord = {
    referenceNo: string
    phone: string
    customerName: string
    type: 'booking' | 'product'
    itemName: string
    statusLabel: string
    appointmentDate: string
    note: string
    timeline: Array<{
        title: string
        at: string
        done: boolean
    }>
}

const selectedRecord = ref<TrackViewRecord | null>(null)
const searchResult = ref<'idle' | 'found' | 'not-found'>('idle')
const lockUntil = ref(0)
const nowTick = ref(Date.now())
const isSearching = ref(false)
let ticker: ReturnType<typeof setInterval> | null = null

const isLocked = computed(() => lockUntil.value > nowTick.value)
const lockRemainingSeconds = computed(() => Math.max(0, Math.ceil((lockUntil.value - nowTick.value) / 1000)))

const getAttemptTimestamps = (): number[] => {
    if (!import.meta.client) return []
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((item) => typeof item === 'number')
    } catch {
        return []
    }
}

const setAttemptTimestamps = (value: number[]) => {
    if (!import.meta.client) return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

const registerAttemptAndUpdateLimit = () => {
    const now = Date.now()
    const valid = getAttemptTimestamps().filter((ts) => now - ts <= ATTEMPT_WINDOW_MS)
    valid.push(now)
    setAttemptTimestamps(valid)

    if (valid.length > MAX_ATTEMPTS_PER_WINDOW) {
        const oldestInWindow = valid[0]
        if (typeof oldestInWindow === 'number') {
            lockUntil.value = oldestInWindow + ATTEMPT_WINDOW_MS
        }
    }
}

const refreshRateLimitState = () => {
    const now = Date.now()
    const valid = getAttemptTimestamps().filter((ts) => now - ts <= ATTEMPT_WINDOW_MS)
    setAttemptTimestamps(valid)
    nowTick.value = now

    if (valid.length > MAX_ATTEMPTS_PER_WINDOW) {
        const oldestInWindow = valid[0]
        if (typeof oldestInWindow === 'number') {
            lockUntil.value = oldestInWindow + ATTEMPT_WINDOW_MS
        }
    } else if (lockUntil.value <= now) {
        lockUntil.value = 0
    }
}

const statusLabelMap: Record<string, string> = {
    pending: 'รอยืนยัน',
    processing: 'กำลังเตรียมงาน',
    completed: 'ส่งมอบแล้ว',
    canceled: 'ยกเลิก'
}

const formatDateTime = (value: string | undefined) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}

const extractAppointmentDate = (note: string | null | undefined) => {
    if (!note) return '-'
    const parts = note.split(':')
    if (parts.length < 2) return '-'
    return parts.slice(1).join(':').trim() || '-'
}

const buildTrackRecord = (item: {
    booking_no: string
    status: string
    delivery_phone?: string | null
    delivery_note?: string | null
    internal_note?: string | null
    created_at: string
    updated_at: string
}): TrackViewRecord => {
    const statusLabel = statusLabelMap[item.status] || item.status

    return {
        referenceNo: item.booking_no,
        phone: item.delivery_phone || searchForm.phone,
        customerName: 'ลูกค้า',
        type: 'booking',
        itemName: 'รายการจอง/สั่งซื้อ',
        statusLabel,
        appointmentDate: extractAppointmentDate(item.delivery_note),
        note: item.internal_note || 'ทีมงานกำลังดำเนินการตามคำขอของคุณ',
        timeline: [
            {
                title: 'สร้างคำขอเรียบร้อย',
                at: formatDateTime(item.created_at),
                done: true
            },
            {
                title: `สถานะล่าสุด: ${statusLabel}`,
                at: formatDateTime(item.updated_at),
                done: true
            }
        ]
    }
}

const handleSearch = async () => {
    refreshRateLimitState()

    if (isLocked.value || isSearching.value) return

    registerAttemptAndUpdateLimit()
    refreshRateLimitState()

    const normalizedRef = searchForm.referenceNo.trim().toUpperCase()
    const normalizedPhone = normalizePhone(searchForm.phone)

    isSearching.value = true
    try {
        const item = await trackBooking(normalizedRef, normalizedPhone)
        selectedRecord.value = buildTrackRecord(item)
        searchResult.value = 'found'
    } catch {
        selectedRecord.value = null
        searchResult.value = 'not-found'
    } finally {
        isSearching.value = false
    }
}

onMounted(() => {
    refreshRateLimitState()

    ticker = setInterval(() => {
        nowTick.value = Date.now()
        if (isLocked.value) return
        refreshRateLimitState()
    }, 1000)

    const refValue = typeof route.query.ref === 'string' ? route.query.ref : ''
    const phoneValue = typeof route.query.phone === 'string' ? route.query.phone : ''

    if (refValue && phoneValue) {
        searchForm.referenceNo = refValue
        searchForm.phone = phoneValue
        void handleSearch()
    }
})

onUnmounted(() => {
    if (ticker) clearInterval(ticker)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.track-page {
    --brand: #065f46;
    --brand-hover: #064e3b;
    --brand-accent: #059669;
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

.badge-brand {
    background: rgba(5, 150, 105, 0.12);
    color: var(--brand);
    border: 1px solid rgba(5, 150, 105, 0.24);
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

.timeline-item {
    border: 1px solid rgba(6, 95, 70, 0.14);
    background: rgba(255, 255, 255, 0.82);
}

.timeline-item.done {
    border-color: rgba(5, 150, 105, 0.28);
    background: rgba(5, 150, 105, 0.08);
}

.timeline-item.pending {
    opacity: 0.8;
}
</style>
