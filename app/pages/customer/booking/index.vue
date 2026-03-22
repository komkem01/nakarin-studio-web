<template>
    <main class="booking-page min-h-screen px-6 py-8 text-[#1f2f2b] md:py-12">
        <section class="mx-auto max-w-6xl">
            <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Booking</p>
                    <h1 class="font-display mt-1 text-3xl md:text-4xl">จองคิวงานบายศรี</h1>
                    <p class="mt-2 text-sm text-[#4f6660]">เลือกแพ็กเกจที่ต้องการ แล้วกรอกวันใช้งานเพื่อให้ทีมงานเช็กคิวให้ทันที</p>
                </div>
                <NuxtLink to="/customer" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                    กลับหน้าหลัก
                </NuxtLink>
            </div>

            <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div class="space-y-4">
                    <article v-for="item in packages" :key="item.name" class="package-card rounded-2xl p-5">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p class="text-xs uppercase tracking-[0.18em] text-[#5a7770]">{{ item.type }}</p>
                                <h2 class="font-display mt-1 text-2xl">{{ item.name }}</h2>
                            </div>
                            <p class="badge-brand rounded-full px-3 py-1 text-sm font-semibold">{{ item.price }}</p>
                        </div>
                        <p class="mt-3 text-sm leading-relaxed text-[#4f6660]">{{ item.detail }}</p>
                        <div class="mt-4 flex items-center justify-between">
                            <p class="text-xs text-[#5a7770]">ดูตัวอย่างงานและรายละเอียดเพิ่มเติมได้</p>
                            <NuxtLink :to="`/customer/booking/${item.slug}`" class="link-brand text-sm font-semibold">
                                ดูรายละเอียด
                            </NuxtLink>
                        </div>
                    </article>
                </div>

                <form class="form-card rounded-2xl p-5 md:p-6" @submit.prevent="handleSubmit">
                    <h3 class="font-display text-2xl">รายละเอียดการจอง</h3>
                    <p class="mt-1 text-sm text-[#4f6660]">ทีมงานจะติดต่อกลับเพื่อยืนยันราคาและกำหนดส่ง</p>

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
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">รายละเอียดเพิ่มเติม</span>
                            <textarea v-model="bookingForm.note" rows="4" placeholder="โทนสีที่ต้องการ สถานที่จัดงาน หรือข้อมูลสำคัญอื่นๆ" class="field resize-none"></textarea>
                        </label>
                    </div>

                    <button type="submit" class="btn-primary mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition">
                        ส่งข้อมูลเพื่อเช็กคิว
                    </button>
                </form>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { generateReferenceNo, normalizePhone } from '~/data/customer-tracking'

const packages = [
    {
        slug: 'mongkol-standard',
        type: 'งานพิธีครอบครัว',
        name: 'บายศรีมงคลมาตรฐาน',
        detail: 'เหมาะสำหรับงานบวช งานขึ้นบ้านใหม่ และพิธีทั่วไป จัดชุดครบพร้อมใช้งาน',
        price: 'เริ่มต้น ฿4,500'
    },
    {
        slug: 'phaya-naga',
        type: 'งานพิธีขนาดใหญ่',
        name: 'บายศรีพญานาค',
        detail: 'เน้นความอลังการและรายละเอียดงานใบตอง เหมาะกับงานที่ต้องการจุดเด่นบนเวที',
        price: 'เริ่มต้น ฿7,900'
    },
    {
        slug: 'executive-welcome',
        type: 'งานองค์กร',
        name: 'บายศรีต้อนรับแขกผู้ใหญ่',
        detail: 'โทนเรียบหรู ดูภูมิฐาน ปรับแบบตามธีมงานและขนาดพื้นที่ได้',
        price: 'เริ่มต้น ฿5,500'
    }
]

const bookingForm = reactive({
    name: '',
    phone: '',
    date: '',
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
            item: 'จองคิวงานบายศรี'
        }
    })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.booking-page {
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