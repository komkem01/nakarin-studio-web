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
                </div>

                <div class="mt-6 flex flex-wrap gap-3">
                    <NuxtLink :to="trackLink" class="btn-primary rounded-xl px-6 py-3 text-sm font-semibold">
                        ไปหน้าติดตามสถานะ
                    </NuxtLink>
                    <NuxtLink to="/customer" class="btn-ghost rounded-xl px-6 py-3 text-sm font-semibold">
                        กลับหน้าหลัก
                    </NuxtLink>
                </div>

                <p class="mt-4 text-sm text-[#4f6660]">
                    หมายเหตุ: หน้าติดตามสถานะจะให้กรอก CAPTCHA เพื่อความปลอดภัยก่อนค้นหา
                </p>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

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

const itemName = computed(() => {
    if (typeof route.query.item === 'string' && route.query.item.trim()) return route.query.item.trim()
    return requestType.value === 'product' ? 'รายการสินค้า' : 'รายการจองคิว'
})

const maskedPhone = computed(() => {
    const onlyDigits = phone.value.replace(/\D/g, '')
    if (onlyDigits.length < 4) return phone.value
    return `${onlyDigits.slice(0, 3)}-xxx-${onlyDigits.slice(-3)}`
})

const trackLink = computed(() => ({
    path: '/customer/track',
    query: {
        ref: referenceNo.value,
        phone: phone.value
    }
}))
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
</style>
