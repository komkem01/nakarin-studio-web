<template>
    <main class="booking-detail-page min-h-screen px-6 py-8 text-[#1f2f2b] md:py-12">
        <section class="mx-auto max-w-6xl">
            <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Package Detail</p>
                    <h1 class="font-display mt-1 text-3xl md:text-4xl">{{ selectedPackage.name }}</h1>
                    <p class="mt-2 text-sm text-[#4f6660]">{{ selectedPackage.type }} • {{ selectedPackage.price }}</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink to="/customer/booking" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        กลับหน้าจองคิว
                    </NuxtLink>
                    <NuxtLink to="/customer" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        หน้าหลัก
                    </NuxtLink>
                </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <article class="package-card rounded-2xl p-5 md:p-6">
                    <div class="mb-5 flex flex-wrap items-center gap-3">
                        <p class="badge-brand rounded-full px-3 py-1 text-sm font-semibold">{{ selectedPackage.price }}</p>
                        <p class="badge-brand rounded-full px-3 py-1 text-sm font-semibold">ระยะเตรียมงาน {{ selectedPackage.prepTime }}</p>
                    </div>

                    <p class="text-sm leading-relaxed text-[#4f6660]">{{ selectedPackage.detail }}</p>

                    <div class="mt-6 grid gap-3 sm:grid-cols-2">
                        <div class="info-card rounded-xl p-4">
                            <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">เหมาะกับงาน</p>
                            <p class="mt-1 text-sm font-semibold text-[#21423b]">{{ selectedPackage.suitableFor }}</p>
                        </div>
                        <div class="info-card rounded-xl p-4">
                            <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">หน้างาน</p>
                            <p class="mt-1 text-sm font-semibold text-[#21423b]">{{ selectedPackage.onSite }}</p>
                        </div>
                    </div>

                    <div class="mt-6">
                        <p class="text-sm font-semibold text-[#36524b]">สิ่งที่รวมในแพ็กเกจ</p>
                        <ul class="mt-3 space-y-2">
                            <li v-for="item in selectedPackage.includes" :key="item" class="flex items-start gap-2 text-sm text-[#4f6660]">
                                <span class="dot mt-1.5"></span>
                                <span>{{ item }}</span>
                            </li>
                        </ul>
                    </div>
                </article>

                <form class="form-card rounded-2xl p-5 md:p-6" @submit.prevent="handleSubmit">
                    <h2 class="font-display text-2xl">จองแพ็กเกจนี้</h2>
                    <p class="mt-1 text-sm text-[#4f6660]">กรอกข้อมูลสั้นๆ ทีมงานจะติดต่อกลับเพื่อยืนยันคิวและราคา</p>

                    <div class="mt-5 space-y-4">
                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อผู้ติดต่อ</span>
                            <input v-model="bookingForm.name" type="text" placeholder="เช่น คุณพิมพ์ชนก" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">เบอร์โทรศัพท์</span>
                            <input v-model="bookingForm.phone" type="tel" placeholder="08x-xxx-xxxx" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">วันที่ใช้งาน</span>
                            <input v-model="bookingForm.date" type="date" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">งบประมาณโดยประมาณ</span>
                            <input v-model="bookingForm.budget" type="text" placeholder="เช่น 6,000 - 8,000 บาท" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">รายละเอียดเพิ่มเติม</span>
                            <textarea v-model="bookingForm.note" rows="4" placeholder="สถานที่จัดงาน ช่วงเวลา หรือข้อกำหนดพิเศษ" class="field resize-none"></textarea>
                        </label>
                    </div>

                    <button type="submit" class="btn-primary mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition">
                        ส่งข้อมูลเพื่อเช็กคิว
                    </button>
                    <p class="mt-3 text-xs text-[#5a7770]">
                        ต้องการดูแพ็กเกจอื่นเพิ่มเติม?
                        <NuxtLink to="/customer/booking" class="link-brand font-semibold">กลับไปหน้ารวมแพ็กเกจ</NuxtLink>
                    </p>
                </form>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { generateReferenceNo, normalizePhone } from '~/data/customer-tracking'

const route = useRoute()

const packageMap: Record<string, {
    type: string
    name: string
    detail: string
    price: string
    prepTime: string
    suitableFor: string
    onSite: string
    includes: string[]
}> = {
    'mongkol-standard': {
        type: 'งานพิธีครอบครัว',
        name: 'บายศรีมงคลมาตรฐาน',
        detail: 'แพ็กเกจเริ่มต้นที่ได้งานสวยครบองค์ประกอบ เหมาะกับงานบวช งานขึ้นบ้านใหม่ และพิธีทั่วไปที่ต้องการความเรียบร้อยดูดี',
        price: 'เริ่มต้น ฿4,500',
        prepTime: '3-5 วัน',
        suitableFor: 'พิธีครอบครัว 30-80 คน',
        onSite: 'ส่งงานตรงเวลา + ตรวจความเรียบร้อย',
        includes: ['ชุดบายศรีหลัก 1 ชุด', 'จัดดอกไม้และวัสดุตามธีมงาน', 'คำแนะนำการจัดวางหน้างาน']
    },
    'phaya-naga': {
        type: 'งานพิธีขนาดใหญ่',
        name: 'บายศรีพญานาค',
        detail: 'เน้นมิติและความอลังการของลายพญานาค เหมาะกับพิธีที่ต้องการจุดเด่นบนเวทีและภาพรวมที่ดูสง่างาม',
        price: 'เริ่มต้น ฿7,900',
        prepTime: '5-7 วัน',
        suitableFor: 'พิธีใหญ่ 80-200 คน',
        onSite: 'ติดตั้งหน้างานและเช็กจุดจัดแสดง',
        includes: ['ชุดบายศรีพญานาค 1 ชุด', 'ออกแบบโทนสีให้เข้าธีมงาน', 'ทีมงานเข้าติดตั้งก่อนเวลาเริ่มงาน']
    },
    'executive-welcome': {
        type: 'งานองค์กร',
        name: 'บายศรีต้อนรับแขกผู้ใหญ่',
        detail: 'รูปแบบเรียบหรู ภูมิฐาน ปรับสัดส่วนตามพื้นที่จริง เหมาะกับงานเปิดตัว งานต้อนรับผู้บริหาร และพิธีการองค์กร',
        price: 'เริ่มต้น ฿5,500',
        prepTime: '3-5 วัน',
        suitableFor: 'งานองค์กรและพิธีทางการ',
        onSite: 'จัดวางตาม flow งานและภาพรวมเวที',
        includes: ['ชุดบายศรีหลัก 1 ชุด', 'ปรับขนาดตามพื้นที่จัดงาน', 'ให้คำแนะนำตำแหน่งจัดวางเพื่อภาพถ่าย']
    }
}

const selectedPackage = computed(() => {
    const key = String(route.params.id || '')
    return packageMap[key] || packageMap['mongkol-standard']
})

const bookingForm = reactive({
    name: '',
    phone: '',
    date: '',
    budget: '',
    note: ''
})

const handleSubmit = async () => {
    const referenceNo = generateReferenceNo()
    const phone = normalizePhone(bookingForm.phone)

    await navigateTo({
        path: '/customer/confirm',
        query: {
            ref: referenceNo,
            phone,
            type: 'booking',
            item: selectedPackage.value.name
        }
    })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.booking-detail-page {
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

.package-card,
.form-card {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(6, 95, 70, 0.14);
    box-shadow: 0 12px 28px rgba(6, 95, 70, 0.08);
}

.info-card {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(6, 95, 70, 0.14);
}

.dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--brand-accent);
    display: inline-block;
    flex-shrink: 0;
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
.link-brand:focus-visible,
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

.link-brand {
    color: var(--brand);
    text-underline-offset: 3px;
}

.link-brand:hover {
    color: var(--brand-hover);
    text-decoration: underline;
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
</style>