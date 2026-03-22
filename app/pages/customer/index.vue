<template>
    <main class="customer-page min-h-screen text-[#1f2f2b]">
        <div class="hero-glow" aria-hidden="true"></div>

        <section class="mx-auto max-w-6xl px-6 pb-10 pt-8 md:pb-16 md:pt-12">
            <header class="flex items-center justify-between">
                <div>
                    <p class="font-display text-brand text-xs uppercase tracking-[0.28em]">Nakarin Studio</p>
                    <p class="mt-1 text-sm text-[#4d6862]">นครินทร์ สตูดิโอ</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink
                        to="/customer/track"
                        class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold backdrop-blur"
                    >
                        ติดตามสถานะ
                    </NuxtLink>
                    <NuxtLink
                        to="/customer/product"
                        class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold backdrop-blur"
                    >
                        สินค้า
                    </NuxtLink>
                    <NuxtLink
                        to="/customer/booking"
                        class="btn-ghost rounded-full px-4 py-2 text-sm font-semibold backdrop-blur"
                    >
                        จองคิว
                    </NuxtLink>
                </div>
            </header>

            <div class="mt-10 grid items-center gap-10 md:mt-14 md:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <p class="badge-brand mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
                        งานสั่งทำด้วยช่างฝีมือ
                    </p>
                    <h1 class="font-display text-4xl leading-tight text-[#1f2f2b] md:text-6xl">
                        บายศรีที่สวยสง่า
                        <span class="text-brand block">พร้อมทุกพิธีสำคัญ</span>
                    </h1>
                    <p class="mt-5 max-w-2xl text-base leading-relaxed text-[#48615b] md:text-lg">
                        ออกแบบงานให้เหมาะกับพิธีของคุณ ทั้งงานมงคล งานบวช งานขึ้นบ้านใหม่ และงานองค์กร
                        แจ้งวันใช้งานล่วงหน้า ทีมงานช่วยวางรายละเอียดให้ครบตั้งแต่แบบงานจนถึงวันส่งมอบ
                    </p>

                    <div class="mt-8 flex flex-wrap gap-3">
                        <NuxtLink
                            to="/customer/track"
                            class="btn-ghost rounded-xl px-6 py-3 text-sm font-semibold"
                        >
                            ตรวจสอบสถานะคำสั่งซื้อ
                        </NuxtLink>
                        <NuxtLink
                            to="/customer/product"
                            class="btn-primary rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5"
                        >
                            เลือกสินค้าและสั่งซื้อ
                        </NuxtLink>
                        <NuxtLink
                            to="/customer/booking"
                            class="btn-primary rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5"
                        >
                            เลือกแบบและจองคิว
                        </NuxtLink>
                        <a
                            href="#highlight"
                            class="btn-ghost rounded-xl px-6 py-3 text-sm font-semibold"
                        >
                            ดูผลงานแนะนำ
                        </a>
                    </div>
                </div>

                <div class="relative">
                    <div class="product-frame rounded-[28px] p-5 shadow-2xl">
                        <p class="text-xs uppercase tracking-[0.2em] text-[#5a7770]">Signature Collection</p>
                        <h2 class="mt-2 font-display text-2xl text-[#21423b]">บายศรีเทพมงคล</h2>
                        <p class="mt-2 text-sm leading-relaxed text-[#4f6660]">
                            โทนทอง-ขาว จัดพานอย่างประณีต เหมาะกับงานพิธีการที่ต้องการความเรียบหรู
                        </p>

                        <div class="mt-6 grid grid-cols-2 gap-3 text-sm">
                            <div class="rounded-xl bg-white/80 p-3">
                                <p class="text-[#5a7770]">ระยะเตรียมงาน</p>
                                <p class="mt-1 font-semibold text-[#21423b]">3-5 วัน</p>
                            </div>
                            <div class="rounded-xl bg-white/80 p-3">
                                <p class="text-[#5a7770]">ราคาเริ่มต้น</p>
                                <p class="mt-1 font-semibold text-[#21423b]">฿4,500</p>
                            </div>
                        </div>
                    </div>
                    <div class="stamp">HANDCRAFTED</div>
                </div>
            </div>
        </section>

        <section id="highlight" class="mx-auto max-w-6xl px-6 pb-8 md:pb-16">
            <div class="mb-5 flex items-end justify-between">
                <div>
                    <p class="text-xs uppercase tracking-[0.18em] text-[#5a7770]">Highlight Works</p>
                    <h3 class="font-display mt-1 text-2xl text-[#1f2f2b] md:text-3xl">ผลงานที่ลูกค้าเลือกบ่อย</h3>
                </div>
                <NuxtLink to="/customer/booking" class="link-brand text-sm font-semibold">
                    ดูทั้งหมด
                </NuxtLink>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
                <article v-for="item in highlights" :key="item.name" class="card rounded-2xl p-5">
                    <p class="text-xs uppercase tracking-[0.18em] text-[#5a7770]">{{ item.tag }}</p>
                    <h4 class="mt-2 font-display text-xl text-[#1f3a34]">{{ item.name }}</h4>
                    <p class="mt-2 text-sm leading-relaxed text-[#4f6660]">{{ item.detail }}</p>
                    <p class="link-brand mt-4 text-sm font-semibold">เริ่มต้น {{ item.price }}</p>
                </article>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
const highlights = [
    {
        tag: 'งานบวช',
        name: 'บายศรีพญานาค',
        detail: 'งานพานสูงเน้นรายละเอียดชั้นใบตองและดอกไม้สด เหมาะกับพิธีที่ต้องการความโดดเด่น',
        price: '฿7,900'
    },
    {
        tag: 'งานมงคลสมรส',
        name: 'บายศรีคู่มงคล',
        detail: 'จัดคู่ตามธีมงาน สีสวยละมุน ถ่ายรูปขึ้นทั้งในงานพิธีและโซนรับแขก',
        price: '฿6,500'
    },
    {
        tag: 'งานองค์กร',
        name: 'บายศรีต้อนรับแขก',
        detail: 'ขนาดกำลังดี ดูภูมิฐาน เหมาะสำหรับพิธีเปิดงานและต้อนรับผู้ใหญ่',
        price: '฿5,500'
    }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Pridi:wght@400;500;700&display=swap');

.customer-page {
    --bg-main: #f8f5f0;
    --bg-soft: #ecf4f0;
    --brand: #065f46;
    --brand-hover: #064e3b;
    --brand-accent: #059669;
    --brand-ring: rgba(16, 185, 129, 0.2);
    --brand-border: rgba(6, 95, 70, 0.2);
    --brand-shadow: rgba(6, 95, 70, 0.2);
    --text-main: #1f2f2b;
    --text-soft: #4f6660;
    background:
        radial-gradient(circle at 12% 12%, rgba(6, 95, 70, 0.16), transparent 36%),
        radial-gradient(circle at 88% 22%, rgba(5, 150, 105, 0.12), transparent 30%),
        var(--bg-main);
    font-family: 'Noto Sans Thai', sans-serif;
}

.font-display {
    font-family: 'Pridi', serif;
}

.hero-glow {
    position: fixed;
    inset: auto 8% 10% auto;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(6, 95, 70, 0.16), transparent 70%);
    pointer-events: none;
    filter: blur(8px);
}

.product-frame {
    background: linear-gradient(165deg, rgba(255, 255, 255, 0.94), rgba(231, 244, 239, 0.78));
    border: 1px solid rgba(6, 95, 70, 0.16);
    box-shadow: 0 20px 44px rgba(6, 95, 70, 0.15);
    backdrop-filter: blur(2px);
}

.stamp {
    position: absolute;
    right: -10px;
    top: -12px;
    border: 1px solid rgba(6, 95, 70, 0.35);
    color: var(--brand);
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    letter-spacing: 0.16em;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.88);
    transform: rotate(8deg);
}

.card {
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(6, 95, 70, 0.12);
    box-shadow: 0 12px 30px rgba(6, 95, 70, 0.08);
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
.link-brand:focus-visible {
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
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid var(--brand-border);
    color: var(--brand);
}

.link-brand {
    color: var(--brand);
    text-underline-offset: 3px;
}

.text-brand {
    color: var(--brand);
}

.link-brand:hover {
    color: var(--brand-hover);
    text-decoration: underline;
}

@media (max-width: 768px) {
    .hero-glow {
        right: -40px;
        width: 180px;
        height: 180px;
    }
}
</style>