<template>
    <section class="admin-page space-y-4">
            <header class="panel rounded-2xl p-5 md:p-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p class="text-sm font-semibold tracking-wide text-[#48645d]">Product Detail</p>
                        <h1 class="mt-1 text-2xl font-bold text-[#21423b]">{{ product.name }}</h1>
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
                        <input v-model="form.category" class="field" />
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

                <p v-if="flashMessage" class="text-sm text-[#4f6660]">{{ flashMessage }}</p>
            </section>

            <dialog ref="saveConfirmDialog" class="modal">
                <div class="modal-box">
                    <h3 class="text-lg font-bold text-[#21423b]">ยืนยันการบันทึกข้อมูล</h3>
                    <p class="py-3 text-sm text-[#48645d]">ต้องการบันทึกการแก้ไขข้อมูลสินค้านี้ใช่หรือไม่</p>
                    <div class="modal-action">
                        <form method="dialog">
                            <button
                                type="submit"
                                class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
                                @click="flashMessage = 'ยกเลิกการบันทึกข้อมูล'"
                            >
                                ยกเลิก
                            </button>
                        </form>
                        <button
                            type="button"
                            class="btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
                            @click="handleSave"
                        >
                            ยืนยันบันทึก
                        </button>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button type="submit">close</button>
                </form>
            </dialog>

            <dialog ref="removeImageConfirmDialog" class="modal">
                <div class="modal-box">
                    <h3 class="text-lg font-bold text-[#21423b]">ยืนยันการลบรูปสินค้า</h3>
                    <p class="py-3 text-sm text-[#48645d]">ต้องการลบรูปสินค้านี้ใช่หรือไม่</p>
                    <div class="modal-action">
                        <form method="dialog">
                            <button
                                type="submit"
                                class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
                                @click="clearPendingRemoveImage"
                            >
                                ยกเลิก
                            </button>
                        </form>
                        <button
                            type="button"
                            class="btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
                            @click="confirmRemoveImage"
                        >
                            ยืนยันลบ
                        </button>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button type="submit" @click="clearPendingRemoveImage">close</button>
                </form>
            </dialog>
    </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useAdminMvpStore } from '~/composables/useAdminMvpStore'
import type { AdminCatalogItem } from '~/data/admin-mvp'

definePageMeta({
    layout: 'admin'
})

const route = useRoute()
const { catalog, updateCatalogItem } = useAdminMvpStore()

const fallbackProduct: AdminCatalogItem = {
    id: 'fallback-product',
    name: 'ไม่พบรายการ',
    category: '-',
    price: 0,
    leadTime: '-',
    isActive: false,
    images: []
}

const product = computed<AdminCatalogItem>(() => {
    const id = String(route.params.id || '')
    return catalog.value.find((item) => item.id === id) || catalog.value[0] || fallbackProduct
})

const form = reactive({
    name: product.value.name,
    category: product.value.category,
    price: product.value.price,
    leadTime: product.value.leadTime,
    isActive: product.value.isActive,
    images: [...(product.value.images || [])]
})

const flashMessage = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
const selectedImageFiles = ref<File[]>([])
const isUploadingImages = ref(false)
const saveConfirmDialog = ref<HTMLDialogElement | null>(null)
const removeImageConfirmDialog = ref<HTMLDialogElement | null>(null)
const pendingRemoveImageIndex = ref<number | null>(null)

const syncForm = () => {
    form.name = product.value.name
    form.category = product.value.category
    form.price = product.value.price
    form.leadTime = product.value.leadTime
    form.isActive = product.value.isActive
    form.images = [...(product.value.images || [])]
}

watch(product, () => {
    syncForm()
    flashMessage.value = ''
})

const handleSave = () => {
    saveConfirmDialog.value?.close()

    const success = updateCatalogItem(product.value.id, {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number.isFinite(form.price) ? Math.max(0, form.price) : 0,
        leadTime: form.leadTime.trim(),
        isActive: form.isActive,
        images: form.images.map((item) => item.trim()).filter(Boolean)
    })

    flashMessage.value = success ? 'บันทึกข้อมูลสินค้าเรียบร้อย' : 'ไม่สามารถบันทึกข้อมูลได้'
}

const requestSave = () => {
    saveConfirmDialog.value?.showModal()
}

const openFilePicker = () => {
    imageInput.value?.click()
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'))
        reader.readAsDataURL(file)
    })
}

const handleImageFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    if (!files.length) return

    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    if (!imageFiles.length) {
        flashMessage.value = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น'
        input.value = ''
        return
    }

    selectedImageFiles.value = imageFiles
    flashMessage.value = `เลือกรูปแล้ว ${imageFiles.length} รูป กรุณากดอัปโหลดรูป`
    input.value = ''
}

const uploadSelectedImages = async () => {
    if (!selectedImageFiles.value.length) {
        flashMessage.value = 'ยังไม่ได้เลือกรูป'
        return
    }

    try {
        isUploadingImages.value = true
        const encodedImages = await Promise.all(selectedImageFiles.value.map((file) => fileToDataUrl(file)))
        form.images = [...form.images, ...encodedImages]
        flashMessage.value = `เพิ่มรูปสินค้าแล้ว ${encodedImages.length} รูป`
        selectedImageFiles.value = []
    } catch {
        flashMessage.value = 'เกิดข้อผิดพลาดในการเพิ่มรูปสินค้า'
    } finally {
        isUploadingImages.value = false
    }
}

const removeImageUrl = (index: number) => {
    form.images = form.images.filter((_, idx) => idx !== index)
    flashMessage.value = 'ลบรูปสินค้าแล้ว'
}

const clearPendingRemoveImage = () => {
    pendingRemoveImageIndex.value = null
}

const requestRemoveImage = (index: number) => {
    pendingRemoveImageIndex.value = index
    removeImageConfirmDialog.value?.showModal()
}

const confirmRemoveImage = () => {
    const index = pendingRemoveImageIndex.value
    if (index === null) return

    removeImageUrl(index)
    clearPendingRemoveImage()
    removeImageConfirmDialog.value?.close()
}
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

.modal {
    border: none;
    padding: 0;
    background: transparent;
}

.modal::backdrop {
    background: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(1px);
}

.modal-box {
    width: min(92vw, 24rem);
    border-radius: 1rem;
    border: 1px solid rgba(6, 95, 70, 0.16);
    background: #fff;
    padding: 1rem;
}

.modal-action {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
}

.modal-backdrop > button {
    display: none;
}
</style>