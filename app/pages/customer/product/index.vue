<template>
    <main class="product-page min-h-screen px-6 py-8 text-[#1f2f2b] md:py-12">
        <section class="mx-auto max-w-6xl">
            <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Products</p>
                    <h1 class="font-display mt-1 text-3xl md:text-4xl">เลือกสินค้าสำเร็จรูป</h1>
                    <p class="mt-2 text-sm text-[#4f6660]">เลือกแบบที่ต้องการและส่งคำสั่งซื้อได้ทันที ทีมงานจะติดต่อกลับเพื่อยืนยันคิว</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink to="/customer/booking" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        ไปหน้าจองคิว
                    </NuxtLink>
                    <NuxtLink to="/customer" class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
                        หน้าหลัก
                    </NuxtLink>
                </div>
            </div>

            <div v-if="isLoading" class="rounded-2xl border border-[rgba(6,95,70,0.14)] bg-white/70 p-6 text-sm text-[#4f6660]">
                กำลังโหลดข้อมูลสินค้าจากระบบ...
            </div>

            <div v-else-if="loadError" class="rounded-2xl border border-[#f3c6c6] bg-[#fff6f6] p-6 text-sm text-[#9b2c2c]">
                {{ loadError }}
            </div>

            <div v-else-if="products.length === 0" class="rounded-2xl border border-[rgba(6,95,70,0.14)] bg-white/70 p-6 text-sm text-[#4f6660]">
                ยังไม่มีข้อมูลสินค้าในระบบ
            </div>

            <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <article v-for="item in products" :key="item.id" class="product-card rounded-2xl p-5">
                    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p class="badge-brand rounded-full px-3 py-1 text-xs font-semibold">{{ item.category }}</p>
                        <p class="text-sm font-semibold text-[#21423b]">{{ item.price }}</p>
                    </div>

                    <h2 class="font-display text-2xl text-[#21423b]">{{ item.name }}</h2>
                    <p class="mt-2 text-sm leading-relaxed text-[#4f6660]">{{ item.description }}</p>

                    <div class="mt-4 space-y-1 text-sm text-[#4f6660]">
                        <p>ระยะเตรียมสินค้า: <span class="font-semibold text-[#21423b]">{{ item.leadTime }}</span></p>
                        <p>ขนาด: <span class="font-semibold text-[#21423b]">{{ item.size }}</span></p>
                    </div>

                    <div class="mt-5 flex gap-2">
                        <NuxtLink :to="`/customer/product/${item.id}`" class="btn-ghost w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold">
                            ดูรายละเอียด
                        </NuxtLink>
                        <NuxtLink :to="`/customer/product/${item.id}`" class="btn-primary w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold">
                            สั่งสินค้า
                        </NuxtLink>
                    </div>
                </article>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePublicBookingApi } from '~/composables/usePublicBookingApi'

type ProductCardItem = {
    id: string
    name: string
    category: string
    description: string
    price: string
    leadTime: string
    size: string
}

const { listProducts } = usePublicBookingApi()

const products = ref<ProductCardItem[]>([])
const isLoading = ref(true)
const loadError = ref('')

const formatPrice = (price: number) => price.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
})

onMounted(async () => {
    isLoading.value = true
    loadError.value = ''

    try {
        const items = await listProducts()
        products.value = items
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => ({
                id: item.id,
                name: item.name,
                category: 'สินค้า',
                description: item.description || 'ไม่มีรายละเอียดสินค้า',
                price: formatPrice(item.price),
                leadTime: item.prep_time > 0 ? `${item.prep_time} วัน` : '-',
                size: '-'
            }))
    } catch {
        products.value = []
        loadError.value = 'ไม่สามารถโหลดข้อมูลสินค้าจริงจากระบบได้ในขณะนี้'
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.product-page {
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

.product-card {
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

.badge-brand {
    background: rgba(5, 150, 105, 0.12);
    color: var(--brand);
    border: 1px solid rgba(5, 150, 105, 0.24);
}
</style>