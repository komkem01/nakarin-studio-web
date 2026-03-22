<template>
    <section class="admin-page space-y-4">
            <header class="panel rounded-2xl p-5 md:p-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p class="text-sm font-semibold tracking-wide text-[#48645d]">Product Detail</p>
                        <h1 class="mt-1 text-2xl font-bold text-[#21423b]">{{ displayProductName }}</h1>
                    </div>
                    <NuxtLink to="/admin/product" class="btn-ghost rounded-xl px-4 py-2 text-sm font-semibold">กลับหน้าจัดการสินค้า</NuxtLink>
                </div>
            </header>

            <section class="panel rounded-2xl p-5 space-y-4">
                <div class="grid gap-4 md:grid-cols-2">
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อรายการ</span>
                        <input v-model="form.name" class="field" />
                    </label>
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-[#36524b]">หมวดหมู่</span>
                        <select v-model="form.categoryId" class="field">
                            <option value="">เลือกหมวดหมู่</option>
                            <option v-for="item in categories" :key="item.id" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>
                    </label>
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-[#36524b]">ราคา</span>
                        <input v-model.number="form.price" type="number" min="0" class="field" />
                    </label>
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-[#36524b]">ระยะเตรียม</span>
                        <input v-model="form.leadTime" class="field" />
                    </label>
                </div>

                <label class="block">
                    <span class="mb-1 block text-sm font-medium text-[#36524b]">รายละเอียดสินค้า</span>
                    <textarea
                        v-model="form.description"
                        rows="4"
                        class="field resize-none"
                        placeholder="ระบุรายละเอียดสินค้า จุดเด่น หรือข้อมูลสำคัญ"
                    ></textarea>
                </label>

                <div class="grid gap-4 md:grid-cols-2">
                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-[#36524b]">เหมาะกับงาน</span>
                        <input
                            v-model="form.suitableFor"
                            class="field"
                            placeholder="เช่น งานครอบครัว 30-80 คน"
                        />
                    </label>

                    <label class="block">
                        <span class="mb-1 block text-sm font-medium text-[#36524b]">หน้างาน</span>
                        <input
                            v-model="form.onSite"
                            class="field"
                            placeholder="เช่น ส่งงานตรงเวลา + ตรวจความเรียบร้อย"
                        />
                    </label>
                </div>

                <label class="block">
                    <span class="mb-1 block text-sm font-medium text-[#36524b]">รายการที่ได้รับ</span>
                    <textarea
                        v-model="form.receivedItems"
                        rows="4"
                        class="field resize-none"
                        placeholder="หนึ่งรายการต่อหนึ่งบรรทัด"
                    ></textarea>
                </label>

                <label class="block">
                    <span class="mb-1 block text-sm font-medium text-[#36524b]">หมายเหตุสำหรับลูกค้า</span>
                    <textarea
                        v-model="form.note"
                        rows="3"
                        class="field resize-none"
                        placeholder="เช่น สี/ขนาดอาจแตกต่างเล็กน้อยตามงานจริง"
                    ></textarea>
                </label>

                <label class="inline-flex items-center gap-2 text-sm text-[#36524b]">
                    <input v-model="form.isActive" type="checkbox" />
                    เปิดขายรายการนี้
                </label>

                <section class="space-y-3">
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-sm font-semibold text-[#36524b]">รูปสินค้า</h2>
                        <span class="text-xs text-[#5a7770]">{{ form.images.length }} รูป</span>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-wrap gap-2">
                            <button class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold" @click="openFilePicker">
                                เลือกรูปจากเครื่อง
                            </button>
                            <button
                                type="button"
                                class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                                :disabled="!selectedImageFiles.length || isUploadingImages"
                                @click="uploadSelectedImages"
                            >
                                {{ isUploadingImages ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป' }}
                            </button>
                            <input
                                ref="imageInput"
                                type="file"
                                accept="image/*"
                                multiple
                                class="hidden"
                                @change="handleImageFileSelect"
                            />
                        </div>

                        <button
                            type="button"
                            class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                            :disabled="isSaving"
                            @click="requestSave"
                        >
                            บันทึก
                        </button>
                    </div>

                    <p v-if="selectedImageFiles.length" class="text-xs text-[#4f6660]">
                        เลือกแล้ว {{ selectedImageFiles.length }} รูป รออัปโหลด
                    </p>

                    <div v-if="form.images.length" class="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
                        <article
                            v-for="(url, index) in form.images"
                            :key="`${url}-${index}`"
                            class="image-card rounded-xl p-3"
                        >
                            <img :src="url" alt="Product image" class="h-full w-full rounded-lg object-cover md:h-80" />
                            <p class="mt-2 line-clamp-2 text-xs text-[#4f6660]">{{ url }}</p>
                            <button
                                class="btn-ghost mt-2 rounded-lg px-3 py-1 text-xs font-semibold"
                                @click="requestRemoveImage(index)"
                            >
                                ลบรูปนี้
                            </button>
                        </article>
                    </div>
                </section>

            </section>

            <div v-if="isSaveModalOpen" class="confirm-overlay" @click.self="closeSaveModal">
                <div class="confirm-box">
                    <h3 class="text-lg font-bold text-[#21423b]">ยืนยันการบันทึกข้อมูล</h3>
                    <p class="py-3 text-sm text-[#48645d]">ต้องการบันทึกการแก้ไขข้อมูลสินค้านี้ใช่หรือไม่</p>
                    <div class="confirm-action">
                        <button
                            type="button"
                            class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
                            :disabled="isSaving"
                            @click="closeSaveModal"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            class="btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
                            :disabled="isSaving"
                            @click="confirmSave"
                        >
                            {{ isSaving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก' }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="isRemoveImageModalOpen" class="confirm-overlay" @click.self="closeRemoveImageModal">
                <div class="confirm-box">
                    <h3 class="text-lg font-bold text-[#21423b]">ยืนยันการลบรูปสินค้า</h3>
                    <p class="py-3 text-sm text-[#48645d]">ต้องการลบรูปสินค้านี้ใช่หรือไม่</p>
                    <div class="confirm-action">
                        <button
                            type="button"
                            class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
                            :disabled="isDeletingImage"
                            @click="closeRemoveImageModal"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            class="btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
                            :disabled="isDeletingImage"
                            @click="confirmRemoveImage"
                        >
                            {{ isDeletingImage ? 'กำลังลบ...' : 'ยืนยันลบ' }}
                        </button>
                    </div>
                </div>
            </div>
    </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

definePageMeta({
    layout: 'admin'
})

type ProductApiItem = {
    id: string
    category_id?: string | null
    name: string
    description?: string | null
    suitable_for?: string | null
    on_site?: string | null
    received_items?: string | null
    note?: string | null
    price: number
    is_active: boolean
    is_available: boolean
    prep_time: number
}

type CategoryApiItem = {
    id: string
    name: string
    is_active: boolean
}

type ProductImageApiItem = {
    id: string
    product_id: string
    image_url: string
    sort_order: number
    is_active: boolean
}

const route = useRoute()
const { request } = useAdminApi()
const { showToast } = useAdminToast()

const productId = computed(() => String(route.params.id || ''))
const product = ref<ProductApiItem | null>(null)
const categories = ref<CategoryApiItem[]>([])
const imageEntries = ref<ProductImageApiItem[]>([])

const form = reactive({
    name: '',
    categoryId: '',
    price: 0,
    leadTime: '',
    description: '',
    suitableFor: '',
    onSite: '',
    receivedItems: '',
    note: '',
    isActive: false,
    images: [] as string[]
})

const imageInput = ref<HTMLInputElement | null>(null)
const selectedImageFiles = ref<File[]>([])
const isUploadingImages = ref(false)
const isSaving = ref(false)
const isDeletingImage = ref(false)
const isSaveModalOpen = ref(false)
const isRemoveImageModalOpen = ref(false)
const pendingRemoveImageIndex = ref<number | null>(null)

const displayProductName = computed(() => form.name || 'ไม่พบรายการ')

const toLeadTimeText = (prepTime: number): string => {
    if (!Number.isFinite(prepTime) || prepTime <= 0) return ''
    return `${prepTime} วัน`
}

const parseLeadTime = (value: string): number => {
    const match = String(value || '').match(/\d+/)
    if (!match) return 0
    const parsed = Number(match[0])
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

const syncForm = () => {
    form.name = product.value?.name || ''
    form.categoryId = product.value?.category_id || ''
    form.price = Number(product.value?.price || 0)
    form.leadTime = toLeadTimeText(Number(product.value?.prep_time || 0))
    form.description = product.value?.description || ''
    form.suitableFor = product.value?.suitable_for || ''
    form.onSite = product.value?.on_site || ''
    form.receivedItems = product.value?.received_items || ''
    form.note = product.value?.note || ''
    form.isActive = Boolean(product.value?.is_active)
    form.images = imageEntries.value.map((item) => item.image_url)
}

const loadProduct = async () => {
    try {
        product.value = await request<ProductApiItem>(`/api/v1/system/products/${productId.value}`, {
            method: 'GET'
        })
    } catch {
        product.value = null
        showToast('warning', 'โหลดข้อมูลสินค้าไม่สำเร็จ')
    }
}

const loadCategories = async () => {
    try {
        categories.value = await request<CategoryApiItem[]>('/api/v1/system/product-categories', {
            method: 'GET',
            query: { is_active: true }
        })
    } catch {
        categories.value = []
        showToast('warning', 'โหลดข้อมูลหมวดหมู่ไม่สำเร็จ')
    }
}

const loadProductImages = async () => {
    try {
        imageEntries.value = await request<ProductImageApiItem[]>('/api/v1/system/product-images', {
            method: 'GET',
            query: {
                product_id: productId.value,
                is_active: true
            }
        })
    } catch {
        imageEntries.value = []
    }
}

const loadPageData = async () => {
    await Promise.all([loadProduct(), loadCategories(), loadProductImages()])
    syncForm()
}

watch(() => route.params.id, async () => {
    await loadPageData()
})

const requestSave = () => {
    if (!form.name.trim()) {
        showToast('warning', 'กรุณาระบุชื่อรายการ')
        return
    }
    if (!form.categoryId) {
        showToast('warning', 'กรุณาเลือกหมวดหมู่')
        return
    }
    isSaveModalOpen.value = true
}

const closeSaveModal = () => {
    if (isSaving.value) return
    isSaveModalOpen.value = false
}

const confirmSave = async () => {
    if (isSaving.value) return

    try {
        isSaving.value = true
        await request<ProductApiItem>(`/api/v1/system/products/${productId.value}`, {
            method: 'PATCH',
            body: {
                category_id: form.categoryId,
                name: form.name.trim(),
                description: form.description.trim() || null,
                suitable_for: form.suitableFor.trim() || null,
                on_site: form.onSite.trim() || null,
                received_items: form.receivedItems.trim() || null,
                note: form.note.trim() || null,
                price: Number.isFinite(form.price) ? Math.max(0, form.price) : 0,
                is_active: form.isActive,
                is_available: form.isActive,
                prep_time: parseLeadTime(form.leadTime),
                sort_order: 0
            }
        })

        await loadProduct()
        syncForm()
        showToast('success', 'บันทึกข้อมูลสินค้าเรียบร้อย')
        isSaveModalOpen.value = false
    } catch {
        showToast('warning', 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
        isSaving.value = false
    }
}

const openFilePicker = () => {
    imageInput.value?.click()
}

const handleImageFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    if (!files.length) return

    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    if (!imageFiles.length) {
        showToast('warning', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        input.value = ''
        return
    }

    selectedImageFiles.value = imageFiles
    showToast('info', `เลือกรูปแล้ว ${imageFiles.length} รูป กรุณากดอัปโหลดรูป`)
    input.value = ''
}

const uploadSelectedImages = async () => {
    if (!selectedImageFiles.value.length) {
        showToast('warning', 'ยังไม่ได้เลือกรูป')
        return
    }

    try {
        isUploadingImages.value = true
        await Promise.all(
            selectedImageFiles.value.map((file, index) => {
                const formData = new FormData()
                formData.append('product_id', productId.value)
                formData.append('sort_order', String(imageEntries.value.length + index))
                formData.append('is_active', 'true')
                formData.append('image', file)

                return request<ProductImageApiItem>('/api/v1/system/product-images/upload', {
                    method: 'POST',
                    body: formData
                })
            })
        )

        await loadProductImages()
        syncForm()
        showToast('success', `เพิ่มรูปสินค้าแล้ว ${selectedImageFiles.value.length} รูป`)
        selectedImageFiles.value = []
    } catch {
        showToast('warning', 'เกิดข้อผิดพลาดในการเพิ่มรูปสินค้า')
    } finally {
        isUploadingImages.value = false
    }
}

const clearPendingRemoveImage = () => {
    pendingRemoveImageIndex.value = null
}

const closeRemoveImageModal = () => {
    if (isDeletingImage.value) return
    clearPendingRemoveImage()
    isRemoveImageModalOpen.value = false
}

const requestRemoveImage = (index: number) => {
    pendingRemoveImageIndex.value = index
    isRemoveImageModalOpen.value = true
}

const confirmRemoveImage = async () => {
    if (isDeletingImage.value) return

    const index = pendingRemoveImageIndex.value
    if (index === null) return

    const target = imageEntries.value[index]
    if (!target) {
        closeRemoveImageModal()
        return
    }

    try {
        isDeletingImage.value = true
        await request<null>(`/api/v1/system/product-images/${target.id}`, {
            method: 'DELETE'
        })

        await loadProductImages()
        syncForm()
        showToast('success', 'ลบรูปสินค้าแล้ว')
        clearPendingRemoveImage()
        isRemoveImageModalOpen.value = false
    } catch {
        showToast('warning', 'ไม่สามารถลบรูปสินค้าได้')
    } finally {
        isDeletingImage.value = false
    }
}

await loadPageData()
</script>

<style scoped>
.admin-page {
    background: radial-gradient(circle at 95% 0%, rgba(6, 95, 70, 0.12), transparent 32%), #f8f5f0;
}

.panel {
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(6, 95, 70, 0.14);
}

.btn-primary {
    color: #fff;
    background: #065f46;
    border: 1px solid transparent;
}

.btn-primary:hover {
    background: #064e3b;
}

.btn-primary:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    background: #6b8f85;
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

.field {
    width: 100%;
    border-radius: 12px;
    border: 1px solid rgba(6, 95, 70, 0.2);
    background: rgba(255, 255, 255, 0.92);
    padding: 0.72rem 0.85rem;
}

.image-card {
    border: 1px solid rgba(6, 95, 70, 0.14);
    background: rgba(255, 255, 255, 0.86);
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
    width: min(92vw, 24rem);
    border-radius: 1rem;
    border: 1px solid rgba(6, 95, 70, 0.16);
    background: #fff;
    padding: 1rem;
}

.confirm-action {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}
</style>