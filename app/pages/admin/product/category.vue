<template>
  <section class="space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <p class="text-sm font-semibold tracking-wide text-[#48645d]">Product Categories</p>
      <h1 class="mt-1 text-2xl font-bold text-[#21423b]">รายการหมวดหมู่สินค้า</h1>
      <p class="mt-1 text-sm text-[#4f6660]">จัดการหมวดหมู่สินค้าโดยเชื่อมต่อ API หลังบ้านจริง</p>
    </header>

    <section class="panel rounded-2xl p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-bold text-[#21423b]">เพิ่มหมวดหมู่ใหม่</h2>
        <div class="flex items-center gap-2">
          <span class="text-xs text-[#5a7770]">ทั้งหมด {{ categories.length }} หมวดหมู่</span>
          <button class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold" :disabled="isLoading" @click="loadProducts">
            {{ isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล' }}
          </button>
        </div>
      </div>

      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อหมวดหมู่</span>
          <input v-model="newCategory.name" class="field" placeholder="เช่น งานพิธีองค์กร" />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">คำอธิบาย</span>
          <textarea
            v-model="newCategory.description"
            rows="3"
            class="field field-long resize-none"
            :maxlength="MAX_DESCRIPTION_LENGTH"
            placeholder="อธิบายการใช้งานหมวดหมู่"
            @input="handleNewDescriptionInput"
          ></textarea>
          <p class="mt-1 text-right text-xs" :class="newCategory.description.length >= MAX_DESCRIPTION_LENGTH ? 'text-[#9f1239]' : 'text-[#5a7770]'">
            {{ newCategory.description.length }}/{{ MAX_DESCRIPTION_LENGTH }}
          </p>
        </label>
      </div>

      <div class="mt-3 flex justify-end">
        <button class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold" :disabled="isCreating" @click="handleCreate">
          {{ isCreating ? 'กำลังเพิ่ม...' : 'เพิ่มหมวดหมู่' }}
        </button>
      </div>

      <p v-if="fetchError" class="mt-3 text-sm font-semibold text-[#9f1239]">{{ fetchError }}</p>
      <p v-else-if="!isLoading && !categories.length" class="mt-3 text-sm text-[#4f6660]">
        ยังไม่มีข้อมูลหมวดหมู่สินค้า
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <article v-for="cat in categories" :key="cat.id" class="panel rounded-2xl p-5">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อหมวดหมู่</span>
          <input v-model="getDraft(cat.id).name" class="field" />
        </label>
        <label class="mt-3 block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">คำอธิบาย</span>
          <textarea
            v-model="getDraft(cat.id).description"
            rows="4"
            class="field field-long resize-none"
            :maxlength="MAX_DESCRIPTION_LENGTH"
            @input="(event) => handleDraftDescriptionInput(cat.id, event)"
          ></textarea>

          <p class="mt-1 text-right text-xs" :class="getDraft(cat.id).description.length >= MAX_DESCRIPTION_LENGTH ? 'text-[#9f1239]' : 'text-[#5a7770]'">
            {{ getDraft(cat.id).description.length }}/{{ MAX_DESCRIPTION_LENGTH }}
          </p>
        </label>

        <p class="mt-3 text-xs text-[#5a7770]">
          สถานะ: {{ cat.is_active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
        </p>

        <div class="mt-3 flex gap-2">
          <button
            class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
            :disabled="isSaving(cat.id) || isDeleting(cat.id)"
            @click="handleSave(cat.id)"
          >
            {{ isSaving(cat.id) ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
          <button
            class="btn-danger rounded-xl px-4 py-2 text-sm font-semibold"
            :disabled="isSaving(cat.id) || isDeleting(cat.id)"
            @click="handleDelete(cat.id)"
          >
            {{ isDeleting(cat.id) ? 'กำลังลบ...' : 'ลบ' }}
          </button>
        </div>
      </article>
    </section>

    <div
      v-if="confirmModal.open"
      class="confirm-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'confirm-modal-title'"
      @click.self="closeConfirmModal"
    >
      <div class="confirm-box">
        <h3 id="confirm-modal-title" class="text-lg font-bold text-[#21423b]">{{ confirmModalTitle }}</h3>
        <p class="mt-2 text-sm text-[#48645d]">{{ confirmModalMessage }}</p>

        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
            :disabled="isConfirmLoading"
            @click="closeConfirmModal"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            :class="[
              'rounded-xl px-3 py-2 text-xs font-semibold text-white',
              confirmModal.mode === 'delete' ? 'btn-danger-solid' : 'btn-primary'
            ]"
            :disabled="isConfirmLoading"
            @click="executeConfirmAction"
          >
            {{ isConfirmLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

type ProductCategoryItem = {
  id: string
  name: string
  description?: string | null
  is_active: boolean
}

const { request } = useAdminApi()
const { showToast } = useAdminToast()
const MAX_DESCRIPTION_LENGTH = 600
const categories = ref<ProductCategoryItem[]>([])
const drafts = reactive<Record<string, { name: string; description: string }>>({})
const newCategory = reactive({
  name: '',
  description: ''
})

const isLoading = ref(false)
const isCreating = ref(false)
const savingById = ref<Record<string, boolean>>({})
const deletingById = ref<Record<string, boolean>>({})
const fetchError = ref('')
const confirmModal = reactive<{
  open: boolean
  mode: 'save' | 'delete'
  categoryId: string
  categoryName: string
}>({
  open: false,
  mode: 'save',
  categoryId: '',
  categoryName: ''
})

const confirmModalTitle = computed(() => {
  return confirmModal.mode === 'delete' ? 'ยืนยันการลบหมวดหมู่' : 'ยืนยันการบันทึกข้อมูล'
})

const confirmModalMessage = computed(() => {
  if (confirmModal.mode === 'delete') {
    return `ต้องการลบหมวดหมู่ ${confirmModal.categoryName} ใช่หรือไม่`
  }

  return `ต้องการบันทึกการแก้ไขหมวดหมู่ ${confirmModal.categoryName} ใช่หรือไม่`
})

const isConfirmLoading = computed(() => {
  if (!confirmModal.categoryId) return false
  return confirmModal.mode === 'delete'
    ? Boolean(deletingById.value[confirmModal.categoryId])
    : Boolean(savingById.value[confirmModal.categoryId])
})

const syncDrafts = () => {
  const next: Record<string, { name: string; description: string }> = {}
  for (const item of categories.value) {
    next[item.id] = {
      name: item.name,
      description: clampDescription(item.description || '')
    }
  }

  Object.keys(drafts).forEach((key) => delete drafts[key])
  Object.assign(drafts, next)
}

const clampDescription = (value: string) => {
  return value.slice(0, MAX_DESCRIPTION_LENGTH)
}

const handleNewDescriptionInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  newCategory.description = clampDescription(target.value || '')
}

const handleDraftDescriptionInput = (id: string, event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const draft = getDraft(id)
  draft.description = clampDescription(target.value || '')
}

const getDraft = (id: string) => {
  if (!drafts[id]) {
    drafts[id] = { name: '', description: '' }
  }
  return drafts[id]
}

const loadProducts = async () => {
  isLoading.value = true
  fetchError.value = ''

  try {
    categories.value = await request<ProductCategoryItem[]>('/api/v1/system/product-categories', {
      method: 'GET'
    })
    syncDrafts()
  } catch {
    categories.value = []
    fetchError.value = 'โหลดข้อมูลหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    showToast('warning', 'โหลดข้อมูลหมวดหมู่ไม่สำเร็จ')
  } finally {
    isLoading.value = false
  }
}

const isSaving = (id: string) => Boolean(savingById.value[id])
const isDeleting = (id: string) => Boolean(deletingById.value[id])

const openConfirmModal = (mode: 'save' | 'delete', categoryId: string, categoryName: string) => {
  confirmModal.open = true
  confirmModal.mode = mode
  confirmModal.categoryId = categoryId
  confirmModal.categoryName = categoryName
}

const closeConfirmModal = () => {
  if (isConfirmLoading.value) return
  confirmModal.open = false
  confirmModal.categoryId = ''
  confirmModal.categoryName = ''
}

const handleCreate = async () => {
  const name = newCategory.name.trim()
  if (!name) {
    showToast('warning', 'กรุณาระบุชื่อหมวดหมู่')
    return
  }

  isCreating.value = true
  try {
    await request<null>('/api/v1/system/product-categories', {
      method: 'POST',
      body: {
        name,
        description: clampDescription(newCategory.description.trim()) || null,
        is_active: true
      }
    })

    newCategory.name = ''
    newCategory.description = ''
    showToast('success', `เพิ่มหมวดหมู่ ${name} เรียบร้อย`)
    await loadProducts()
  } catch {
    showToast('warning', 'ไม่สามารถเพิ่มหมวดหมู่ได้')
  } finally {
    isCreating.value = false
  }
}

const handleSave = (id: string) => {
  if (isSaving(id) || isDeleting(id)) return

  const draft = drafts[id]
  if (!draft) return

  const categoryName = draft.name.trim() || 'หมวดหมู่'
  openConfirmModal('save', id, categoryName)
}

const handleDelete = (id: string) => {
  if (isSaving(id) || isDeleting(id)) return

  const current = categories.value.find((item) => item.id === id)
  if (!current) return

  openConfirmModal('delete', id, current.name)
}

const executeConfirmAction = async () => {
  const id = confirmModal.categoryId
  if (!id) return

  if (confirmModal.mode === 'delete') {
    await executeDelete(id)
  } else {
    await executeSave(id)
  }

  closeConfirmModal()
}

const executeSave = async (id: string) => {
  const draft = drafts[id]
  if (!draft || !draft.name.trim()) {
    showToast('warning', 'กรุณาระบุชื่อหมวดหมู่')
    return
  }

  try {
    savingById.value = { ...savingById.value, [id]: true }
    await request<ProductCategoryItem>(`/api/v1/system/product-categories/${id}`, {
      method: 'PATCH',
      body: {
        name: draft.name.trim(),
        description: clampDescription(draft.description.trim()) || null
      }
    })
    showToast('success', 'บันทึกหมวดหมู่เรียบร้อย')
    await loadProducts()
  } catch {
    showToast('warning', 'ไม่สามารถบันทึกหมวดหมู่ได้')
  } finally {
    const next = { ...savingById.value }
    delete next[id]
    savingById.value = next
  }
}

const executeDelete = async (id: string) => {
  try {
    deletingById.value = { ...deletingById.value, [id]: true }
    await request<null>(`/api/v1/system/product-categories/${id}`, {
      method: 'DELETE'
    })
    showToast('success', 'ลบหมวดหมู่เรียบร้อย')
    await loadProducts()
  } catch {
    showToast('warning', 'ไม่สามารถลบหมวดหมู่ได้')
  } finally {
    const next = { ...deletingById.value }
    delete next[id]
    deletingById.value = next
  }
}

await loadProducts()
</script>

<style scoped>
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

.btn-ghost {
  color: #065f46;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.82);
}

.btn-ghost:hover {
  background: #065f46;
  color: #fff;
}

.btn-ghost:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-danger {
  color: #9f1239;
  border: 1px solid rgba(225, 29, 72, 0.25);
  background: rgba(255, 241, 242, 0.9);
}

.btn-danger:hover {
  color: #fff;
  border-color: #be123c;
  background: #be123c;
}

.btn-danger-solid {
  background: #be123c;
  border: 1px solid #be123c;
}

.btn-danger-solid:hover {
  background: #9f1239;
  border-color: #9f1239;
}

.field {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: #ffffff;
  color: #21423b;
  padding: 0.72rem 0.85rem;
}

.field:focus {
  outline: none;
  border-color: rgba(6, 95, 70, 0.55);
  box-shadow: 0 0 0 3px rgba(6, 95, 70, 0.12);
}

.field-long {
  max-height: 13rem;
  overflow-y: auto;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
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
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.2);
}

</style>
