<template>
    <main class="product-detail-page min-h-screen px-6 py-8 text-[#1f2f2b] md:py-12">
        <section class="mx-auto max-w-6xl">
            <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Product Detail</p>
                    <h1 class="font-display mt-1 text-3xl md:text-4xl">{{ selectedProduct.name }}</h1>
                    <p class="mt-2 text-sm text-[#4f6660]">{{ selectedProduct.category }} • {{ selectedProduct.price }}</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink to="/customer/product" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        กลับหน้าสินค้า
                    </NuxtLink>
                    <NuxtLink to="/customer" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        หน้าหลัก
                    </NuxtLink>
                </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <article class="product-card rounded-2xl p-5 md:p-6">
                    <div class="mb-5 flex flex-wrap items-center gap-3">
                        <p class="badge-brand rounded-full px-3 py-1 text-sm font-semibold">{{ selectedProduct.price }}</p>
                        <p class="badge-brand rounded-full px-3 py-1 text-sm font-semibold">ระยะเตรียม {{ selectedProduct.leadTime }}</p>
                        <p class="badge-brand rounded-full px-3 py-1 text-sm font-semibold">{{ selectedProduct.size }}</p>
                    </div>

                    <p class="text-sm leading-relaxed text-[#4f6660]">{{ selectedProduct.description }}</p>

                    <div class="mt-6">
                        <p class="text-sm font-semibold text-[#36524b]">รายการที่ได้รับ</p>
                        <ul class="mt-3 space-y-2">
                            <li v-for="item in selectedProduct.includes" :key="item" class="flex items-start gap-2 text-sm text-[#4f6660]">
                                <span class="dot mt-1.5"></span>
                                <span>{{ item }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="mt-6 rounded-xl border border-[rgba(6,95,70,0.14)] bg-white/80 p-4">
                        <p class="text-xs uppercase tracking-[0.16em] text-[#5a7770]">หมายเหตุ</p>
                        <p class="mt-1 text-sm font-medium text-[#21423b]">{{ selectedProduct.note }}</p>
                    </div>
                </article>

                <form class="form-card rounded-2xl p-5 md:p-6" @submit.prevent="handleSubmit">
                    <h2 class="font-display text-2xl">สั่งสินค้า</h2>
                    <p class="mt-1 text-sm text-[#4f6660]">กรอกข้อมูลสั้นๆ เพื่อยืนยันรายละเอียดก่อนจัดเตรียมสินค้า</p>

                    <div class="mt-5 space-y-4">
                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อผู้สั่ง</span>
                            <input v-model="orderForm.name" type="text" placeholder="เช่น คุณพิมพ์ชนก" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">เบอร์โทรศัพท์</span>
                            <input v-model="orderForm.phone" type="tel" placeholder="08x-xxx-xxxx" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">จำนวน</span>
                            <input v-model="orderForm.quantity" type="number" min="1" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">วันที่ต้องการรับสินค้า</span>
                            <input v-model="orderForm.pickupDate" type="date" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">รายละเอียดเพิ่มเติม</span>
                            <textarea v-model="orderForm.note" rows="4" placeholder="สถานที่รับสินค้า สีที่ต้องการ หรือข้อความบนป้าย" class="field resize-none"></textarea>
                        </label>
                    </div>

                    <button type="submit" class="btn-primary mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition">
                        ส่งคำสั่งซื้อ
                    </button>
                    <p class="mt-3 text-xs text-[#5a7770]">
                        อยากดูสินค้ารายการอื่น?
                        <NuxtLink to="/customer/product" class="link-brand font-semibold">กลับไปหน้าสินค้าทั้งหมด</NuxtLink>
                    </p>
                </form>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useAdminMvpStore } from '~/composables/useAdminMvpStore'
import { customerProductMap, customerProducts } from '~/data/customer-products'
import type { CustomerProduct } from '~/data/customer-products'
import { generateReferenceNo, normalizePhone } from '~/data/customer-tracking'

const route = useRoute()
const { createBookingRequest } = useAdminMvpStore()

const fallbackProduct: CustomerProduct = {
    id: 'fallback-product',
    name: 'สินค้าแนะนำ',
    category: 'สินค้า',
    description: 'รายการสินค้าเริ่มต้นสำหรับแสดงผลเมื่อไม่พบรหัสสินค้า',
    price: '฿0',
    leadTime: '2-3 วัน',
    size: 'ขนาดมาตรฐาน',
    includes: ['สินค้า 1 รายการ'],
    note: 'กรุณาติดต่อทีมงานเพื่อยืนยันรายละเอียด'
}

const selectedProduct = computed<CustomerProduct>(() => {
    const key = String(route.params.id || '')
    return customerProductMap[key] || customerProductMap['tray-heritage'] || fallbackProduct
})

const orderForm = reactive({
    name: '',
    phone: '',
    quantity: 1,
    pickupDate: '',
    note: ''
})

const handleSubmit = async () => {
    const referenceNo = generateReferenceNo()
    const phone = normalizePhone(orderForm.phone)

    createBookingRequest({
        customerName: orderForm.name.trim() || 'ลูกค้าใหม่',
        phone,
        packageName: selectedProduct.value.name,
        eventDate: orderForm.pickupDate || selectedProduct.value.leadTime,
        budget: selectedProduct.value.price.replace('฿', ''),
        referenceNo,
        note: orderForm.note
    })

    await navigateTo({
        path: '/customer/confirm',
        query: {
            ref: referenceNo,
            phone,
            type: 'product',
            item: selectedProduct.value.name
        }
    })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.product-detail-page {
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

.product-card,
.form-card {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(6, 95, 70, 0.14);
    box-shadow: 0 12px 28px rgba(6, 95, 70, 0.08);
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