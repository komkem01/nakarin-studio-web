<template>
    <main class="confirm-page min-h-screen px-6 py-8 text-[#1f2f2b] md:py-12">
        <section class="mx-auto max-w-4xl">
            <div class="card rounded-3xl p-6 md:p-8">
                <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Order Confirmed</p>
                <h1 class="font-display mt-2 text-3xl md:text-4xl">ยืนยันคำสั่งสำเร็จ</h1>
                <p class="mt-2 text-sm text-[#4f6660]">
                    ระบบบันทึกรายการเรียบร้อยแล้ว กรุณาเก็บเลขอ้างอิงไว้ใช้สำหรับตรวจสอบสถานะ
                </p>

                <div class="mt-6 grid gap-4 rounded-2xl border border-[rgba(6,95,70,0.16)] bg-white/85 p-5 md:grid-cols-2">
                    <div>
                        <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">ประเภท</p>
                        <p class="mt-1 text-base font-semibold text-[#21423b]">{{ requestTypeLabel }}</p>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">รายการ</p>
                        <p class="mt-1 text-base font-semibold text-[#21423b]">{{ itemName }}</p>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">เลขอ้างอิง</p>
                        <p class="mt-1 text-base font-semibold text-[#21423b]">{{ referenceNo }}</p>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">เบอร์โทรค้นหา</p>
                        <p class="mt-1 text-base font-semibold text-[#21423b]">{{ maskedPhone }}</p>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">สถานะจากระบบ</p>
                        <p class="mt-1 text-base font-semibold text-[#21423b]">{{ backendStatusLabel }}</p>
                    </div>
                </div>

                <p v-if="isChecking" class="mt-3 text-sm text-[#4f6660]">กำลังตรวจสอบสถานะล่าสุดจากระบบ...</p>
                <p v-else-if="checkError" class="mt-3 text-sm text-[#9b2c2c]">{{ checkError }}</p>

                <div class="mt-6 flex flex-wrap gap-3">
                    <NuxtLink :to="paymentLink" class="btn-primary rounded-xl px-6 py-3 text-sm font-semibold">
                        ชำระเงินตอนนี้
                    </NuxtLink>
                    <NuxtLink to="/customer" class="btn-ghost rounded-xl px-6 py-3 text-sm font-semibold">
                        กลับหน้าหลัก
                    </NuxtLink>
                </div>

                <p class="mt-4 text-sm text-[#4f6660]">
                    หมายเหตุ: ใช้เลขอ้างอิงและเบอร์โทรนี้ในการติดตามสถานะได้ทันที
                </p>
            </div>
        </section>

        <div
            v-if="isSaveRefModalOpen"
            class="confirm-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-ref-title"
            @click.self="closeSaveRefModal"
        >
            <div class="confirm-box">
                <h2 id="save-ref-title" class="font-display text-2xl text-[#21423b]">บันทึกเลขอ้างอิงไว้ก่อน</h2>
                <p class="mt-2 text-sm text-[#4f6660]">กรุณาแคปหน้าจอนี้เพื่อเก็บเลขอ้างอิงไว้ใช้ติดตามสถานะภายหลัง</p>

                <div class="mt-4 rounded-xl border border-[rgba(6,95,70,0.16)] bg-white p-4">
                    <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">เลขอ้างอิง</p>
                    <p class="mt-1 text-xl font-bold text-[#21423b]">{{ referenceNo }}</p>
                    <p class="mt-2 text-xs text-[#5a7770]">เบอร์โทรค้นหา: {{ maskedPhone }}</p>
                </div>

                <p class="mt-3 text-xs text-[#5a7770]">
                    เคล็ดลัด: Mac กด Shift + Command + 3, iPhone กดปุ่มเพิ่มเสียง + ปุ่มข้างเครื่อง, Android กดปุ่มลดเสียง + ปุ่มเปิด/ปิด
                </p>

                <div class="mt-5 flex flex-wrap justify-end gap-2">
                    <button type="button" class="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold" @click="copyReferenceNo">
                        {{ copiedRef ? 'คัดลอกแล้ว' : 'คัดลอกเลขอ้างอิง' }}
                    </button>
                    <button
                        type="button"
                        class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                        :disabled="isDownloadingImage"
                        @click="downloadReferenceImage"
                    >
                        {{ isDownloadingImage ? 'กำลังสร้างภาพ...' : 'ดาวน์โหลดภาพเลขอ้างอิง' }}
                    </button>
                    <button type="button" class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold" @click="closeSaveRefModal">
                        บันทึกแล้ว
                    </button>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { PublicBookingTrackData } from '~/composables/usePublicBookingApi'
import { usePublicBookingApi } from '~/composables/usePublicBookingApi'

const route = useRoute()
const { trackBooking } = usePublicBookingApi()

const backendStatus = ref<null | 'pending' | 'processing' | 'completed' | 'canceled'>(null)
const bookingId = ref('')
const trackingData = ref<PublicBookingTrackData | null>(null)
const isChecking = ref(false)
const checkError = ref('')
const isSaveRefModalOpen = ref(false)
const copiedRef = ref(false)
const isDownloadingImage = ref(false)
let copiedRefTimer: ReturnType<typeof setTimeout> | null = null

const referenceNo = computed(() => {
    if (typeof route.query.ref === 'string' && route.query.ref.trim()) return route.query.ref.trim().toUpperCase()
    return 'NS-UNKNOWN'
})

const phone = computed(() => {
    if (typeof route.query.phone === 'string' && route.query.phone.trim()) return route.query.phone.trim()
    return '-'
})

const requestType = computed(() => {
    if (route.query.type === 'product') return 'product'
    return 'booking'
})

const requestTypeLabel = computed(() => requestType.value === 'product' ? 'คำสั่งซื้อสินค้า' : 'การจองคิวงาน')

const backendStatusLabel = computed(() => {
    if (!backendStatus.value) return 'รอตรวจสอบ'

    if (backendStatus.value === 'pending') return 'รอดำเนินการ'
    if (backendStatus.value === 'processing') return 'กำลังดำเนินการ'
    if (backendStatus.value === 'completed') return 'เสร็จสิ้น'
    return 'ยกเลิก'
})

const itemName = computed(() => {
    if (typeof route.query.item === 'string' && route.query.item.trim()) return route.query.item.trim()
    return requestType.value === 'product' ? 'รายการสินค้า' : 'รายการจองคิว'
})

const maskedPhone = computed(() => {
    const onlyDigits = phone.value.replace(/\D/g, '')
    if (onlyDigits.length < 4) return phone.value
    return `${onlyDigits.slice(0, 3)}-xxx-${onlyDigits.slice(-3)}`
})

const customerNameLabel = computed(() => {
    const firstName = trackingData.value?.delivery_first_name?.trim() || ''
    const lastName = trackingData.value?.delivery_last_name?.trim() || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || 'ไม่ระบุชื่อผู้จอง'
})

const customerNoteLabel = computed(() => {
    const note = trackingData.value?.internal_note?.trim()
    return note || 'ไม่มี'
})

const orderCreatedAtLabel = computed(() => {
    const createdAt = trackingData.value?.created_at
    if (!createdAt) return '-'
    const date = new Date(createdAt)
    if (Number.isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date)
})

const trackLink = computed(() => ({
    path: '/customer/track',
    query: {
        ref: referenceNo.value,
        phone: phone.value
    }
}))

const paymentLink = computed(() => ({
    path: '/customer/payment',
    query: {
        id: bookingId.value || undefined,
        ref: referenceNo.value,
        phone: phone.value,
        item: itemName.value
    }
}))

const openSaveRefModal = () => {
    isSaveRefModalOpen.value = true
}

const closeSaveRefModal = () => {
    isSaveRefModalOpen.value = false
}

const copyReferenceNo = async () => {
    if (!import.meta.client) return

    try {
        await navigator.clipboard.writeText(referenceNo.value)
        copiedRef.value = true
        if (copiedRefTimer) {
            clearTimeout(copiedRefTimer)
        }
        copiedRefTimer = setTimeout(() => {
            copiedRef.value = false
        }, 1500)
    } catch {
        copiedRef.value = false
    }
}

const downloadReferenceImage = async () => {
    if (!import.meta.client || isDownloadingImage.value) return

    isDownloadingImage.value = true
    try {
        const canvas = document.createElement('canvas')
        canvas.width = 1200
        canvas.height = 960

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            isDownloadingImage.value = false
            return
        }

        ctx.fillStyle = '#f8f5f0'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = 'rgba(6,95,70,0.22)'
        ctx.lineWidth = 2
        const cardX = 80
        const cardY = 80
        const cardW = 1040
        const cardH = 800
        ctx.beginPath()
        ctx.roundRect(cardX, cardY, cardW, cardH, 24)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#5a7770'
        ctx.font = '600 26px Noto Sans Thai, sans-serif'
        ctx.fillText('หลักฐานการยืนยันรายการ', 130, 160)

        ctx.fillStyle = '#21423b'
        ctx.font = '700 56px Noto Sans Thai, sans-serif'
        ctx.fillText(referenceNo.value, 130, 255)

        ctx.fillStyle = '#36524b'
        ctx.font = '600 30px Noto Sans Thai, sans-serif'
        ctx.fillText(`ประเภท: ${requestTypeLabel.value}`, 130, 330)
        ctx.fillText(`รายการ: ${itemName.value}`, 130, 380)
        ctx.fillText(`ผู้จอง: ${customerNameLabel.value}`, 130, 430)
        ctx.fillText(`เบอร์โทรค้นหา: ${maskedPhone.value}`, 130, 480)
        ctx.fillText(`สถานะล่าสุด: ${backendStatusLabel.value}`, 130, 530)
        ctx.fillText(`สร้างรายการเมื่อ: ${orderCreatedAtLabel.value}`, 130, 580)

        ctx.fillStyle = '#21423b'
        ctx.font = '700 24px Noto Sans Thai, sans-serif'
        ctx.fillText('หมายเหตุจากลูกค้า', 130, 650)

        ctx.fillStyle = '#4f6660'
        ctx.font = '500 22px Noto Sans Thai, sans-serif'
        const maxChars = 70
        const note = customerNoteLabel.value
        const wrapped = note.length > maxChars
            ? `${note.slice(0, maxChars)}...`
            : note
        ctx.fillText(wrapped, 130, 695)

        const now = new Date()
        const timestamp = new Intl.DateTimeFormat('th-TH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(now)
        ctx.fillStyle = '#5a7770'
        ctx.font = '500 24px Noto Sans Thai, sans-serif'
        ctx.fillText(`สร้างไฟล์ภาพเมื่อ: ${timestamp}`, 130, 775)

        ctx.fillStyle = '#5a7770'
        ctx.font = '500 22px Noto Sans Thai, sans-serif'
        ctx.fillText('กรุณาเก็บภาพนี้ไว้เพื่อตรวจสอบสถานะภายหลัง', 130, 825)

        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `${referenceNo.value || 'booking-reference'}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } finally {
        isDownloadingImage.value = false
    }
}

onBeforeUnmount(() => {
    if (copiedRefTimer) {
        clearTimeout(copiedRefTimer)
        copiedRefTimer = null
    }
})

onMounted(async () => {
    openSaveRefModal()

    if (referenceNo.value === 'NS-UNKNOWN' || phone.value === '-') return

    isChecking.value = true
    checkError.value = ''

    try {
        const tracking = await trackBooking(referenceNo.value, phone.value)
        trackingData.value = tracking
        backendStatus.value = tracking.status
        bookingId.value = tracking.id
    } catch {
        trackingData.value = null
        backendStatus.value = null
        bookingId.value = ''
        checkError.value = 'ไม่สามารถตรวจสอบสถานะล่าสุดจากระบบได้ในขณะนี้'
    } finally {
        isChecking.value = false
    }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.confirm-page {
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

.btn-primary {
    background: var(--brand);
    color: #fff;
    border: 1px solid transparent;
    box-shadow: 0 10px 24px var(--brand-shadow);
    transition: background-color 0.2s ease;
}

.btn-primary:hover {
    background: var(--brand-hover);
}

.btn-primary:focus-visible,
.btn-ghost:focus-visible {
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

.confirm-overlay {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.36);
    backdrop-filter: blur(1px);
}

.confirm-box {
    width: min(92vw, 30rem);
    border-radius: 1rem;
    border: 1px solid rgba(6, 95, 70, 0.16);
    background: #fff;
    padding: 1rem;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.2);
}
</style>
