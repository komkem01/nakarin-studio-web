<template>
  <section class="space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <p class="text-sm font-semibold tracking-wide text-[#48645d]">Product Categories</p>
      <h1 class="mt-1 text-2xl font-bold text-[#21423b]">รายการหมวดหมู่สินค้า</h1>
      <p class="mt-1 text-sm text-[#4f6660]">จัดการหมวดหมู่เพื่อใช้แยกรายการสินค้าในระบบหลังบ้าน</p>
    </header>

    <section class="panel rounded-2xl p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-bold text-[#21423b]">เพิ่มหมวดหมู่ใหม่</h2>
        <span class="text-xs text-[#5a7770]">ทั้งหมด {{ categories.length }} หมวดหมู่</span>
      </div>

      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อหมวดหมู่</span>
          <input v-model="newCategory.name" class="field" placeholder="เช่น งานพิธีองค์กร" />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">คำอธิบาย</span>
          <input v-model="newCategory.description" class="field" placeholder="อธิบายการใช้งานหมวดหมู่" />
        </label>
      </div>

      <div class="mt-3 flex justify-end">
        <button class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold" @click="handleCreate">เพิ่มหมวดหมู่</button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <article v-for="cat in categories" :key="cat.id" class="panel rounded-2xl p-5">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อหมวดหมู่</span>
          <input v-model="getDraft(cat.id).name" class="field" />
        </label>
        <label class="mt-3 block">
          <span class="mb-1 block text-sm font-medium text-[#36524b]">คำอธิบาย</span>
          <textarea v-model="getDraft(cat.id).description" rows="3" class="field resize-none"></textarea>
        </label>

        <p class="mt-3 text-xs text-[#5a7770]">
          ใช้งานในสินค้า {{ countCatalogByCategory(cat.name) }} รายการ
        </p>

        <div class="mt-3 flex gap-2">
          <button class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold" @click="handleSave(cat.id)">บันทึก</button>
          <button class="btn-danger rounded-xl px-4 py-2 text-sm font-semibold" @click="handleDelete(cat.id)">ลบ</button>
        </div>
      </article>
    </section>

    <dialog ref="confirmDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold text-[#21423b]">{{ confirmTitle }}</h3>
        <p class="py-3 text-sm text-[#48645d]">{{ confirmMessage }}</p>
        <div class="modal-action">
          <form method="dialog">
            <button type="submit" class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold">ยกเลิก</button>
          </form>
          <button
            type="button"
            :class="[
              'rounded-xl px-3 py-2 text-xs font-semibold',
              pendingAction === 'delete' ? 'btn-danger' : 'btn-primary'
            ]"
            @click="executePendingAction"
          >
            ยืนยัน
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>

    <p v-if="flashMessage" class="text-sm text-[#4f6660]">{{ flashMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useAdminMvpStore } from '~/composables/useAdminMvpStore'

definePageMeta({
  layout: 'admin'
})

const { categories, catalog, updateCategory, createCategory, deleteCategory } = useAdminMvpStore()
const flashMessage = ref('')
const confirmDialog = ref<HTMLDialogElement | null>(null)
const pendingAction = ref<'save' | 'delete' | null>(null)
const pendingCategoryId = ref<string>('')
const pendingCategoryName = ref('')
const newCategory = reactive({
  name: '',
  description: ''
})

const confirmTitle = computed(() => {
  return pendingAction.value === 'delete' ? 'ยืนยันการลบหมวดหมู่' : 'ยืนยันการบันทึกข้อมูล'
})

const confirmMessage = computed(() => {
  if (pendingAction.value === 'delete') {
    return `ต้องการลบหมวดหมู่ ${pendingCategoryName.value} ใช่หรือไม่`
  }

  return `ต้องการบันทึกการแก้ไขหมวดหมู่ ${pendingCategoryName.value} ใช่หรือไม่`
})

const drafts = reactive<Record<string, { name: string; description: string }>>({})

const syncDrafts = () => {
  categories.value.forEach((cat) => {
    drafts[cat.id] = {
      name: cat.name,
      description: cat.description
    }
  })
}

watch(
  categories,
  () => {
    syncDrafts()
  },
  { immediate: true, deep: true }
)

const countCatalogByCategory = (categoryName: string): number => {
  return catalog.value.filter((item) => item.category === categoryName).length
}

const getDraft = (id: string) => {
  if (!drafts[id]) {
    drafts[id] = { name: '', description: '' }
  }

  return drafts[id]
}

const handleSave = (id: string) => {
  const draft = drafts[id]
  if (!draft) return

  pendingAction.value = 'save'
  pendingCategoryId.value = id
  pendingCategoryName.value = draft.name.trim() || 'หมวดหมู่'
  confirmDialog.value?.showModal()
}

const handleCreate = () => {
  if (!newCategory.name.trim()) {
    flashMessage.value = 'กรุณาระบุชื่อหมวดหมู่'
    return
  }

  const created = createCategory({
    name: newCategory.name,
    description: newCategory.description
  })

  drafts[created.id] = {
    name: created.name,
    description: created.description
  }

  newCategory.name = ''
  newCategory.description = ''
  flashMessage.value = `เพิ่มหมวดหมู่ ${created.name} เรียบร้อย`
}

const handleDelete = (id: string) => {
  const source = categories.value.find((item) => item.id === id)
  if (!source) return

  pendingAction.value = 'delete'
  pendingCategoryId.value = id
  pendingCategoryName.value = source.name
  confirmDialog.value?.showModal()
}

const executePendingAction = () => {
  const action = pendingAction.value
  const id = pendingCategoryId.value
  if (!action || !id) return

  if (action === 'save') {
    const draft = drafts[id]
    if (!draft) {
      flashMessage.value = 'ไม่พบข้อมูลหมวดหมู่ที่ต้องการบันทึก'
    } else {
      const success = updateCategory(id, {
        name: draft.name.trim(),
        description: draft.description.trim()
      })

      flashMessage.value = success ? 'บันทึกหมวดหมู่เรียบร้อย' : 'ไม่สามารถบันทึกหมวดหมู่ได้'
    }
  }

  if (action === 'delete') {
    const success = deleteCategory(id)
    if (success) {
      delete drafts[id]
    }

    flashMessage.value = success ? 'ลบหมวดหมู่เรียบร้อย' : 'ไม่สามารถลบหมวดหมู่ได้'
  }

  pendingAction.value = null
  pendingCategoryId.value = ''
  pendingCategoryName.value = ''
  confirmDialog.value?.close()
}
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

.field {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.72rem 0.85rem;
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
