<template>
  <section class="admin-page space-y-4">
      <header class="panel rounded-2xl p-5 md:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold tracking-wide text-[#48645d]">
              Product Management
            </p>
            <h1 class="mt-1 text-2xl font-bold text-[#21423b] md:text-3xl">
              จัดการสินค้าและแพ็กเกจ
            </h1>
          </div>
        </div>
      </header>

      <section class="panel rounded-2xl p-5 md:p-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-bold text-[#21423b]">
            {{ editingProductId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่" }}
          </h2>
          <span class="text-xs text-[#5f7871]"
            >รายการทั้งหมด {{ catalog.length }} รายการ</span
          >
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label class="field-block">
            <span class="field-label">ชื่อสินค้า</span>
            <input
              v-model="newItem.name"
              type="text"
              class="field-input"
              placeholder="เช่น ข้าวกล่องสุขภาพ"
            />
          </label>

          <label class="field-block">
            <span class="field-label">หมวดหมู่</span>
            <div class="relative">
              <button
                type="button"
                class="field-input field-dropdown-btn"
                @click.stop="toggleCategoryMenu"
              >
                {{ newItem.category || "เลือกหมวดหมู่" }}
              </button>
              <ul
                v-if="isCategoryMenuOpen"
                class="dropdown dropdown-full menu rounded-xl bg-white shadow-md"
                @click.stop
              >
                <li v-for="category in categorySuggestions" :key="category">
                  <button
                    type="button"
                    class="dropdown-item"
                    @click="selectCategory(category)"
                  >
                    {{ category }}
                  </button>
                </li>
              </ul>
            </div>
          </label>

          <label class="field-block">
            <span class="field-label">ราคา (บาท)</span>
            <input
              v-model.number="newItem.price"
              type="number"
              min="0"
              step="10"
              class="field-input"
            />
          </label>

          <label class="field-block">
            <span class="field-label">เวลาเตรียม</span>
            <input
              v-model="newItem.leadTime"
              type="text"
              class="field-input"
              placeholder="เช่น 2-3 วัน"
            />
          </label>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-[#21423b]">
            <input
              v-model="newItem.isActive"
              type="checkbox"
              class="h-4 w-4 accent-[#0f766e]"
            />
            เปิดขายทันที
          </label>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-brand rounded-xl px-4 py-2 text-sm font-semibold"
              @click="requestCreateOrUpdate"
            >
              {{ editingProductId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า" }}
            </button>
            <button
              v-if="editingProductId"
              type="button"
              class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
              @click="cancelEdit"
            >
              ยกเลิกการแก้ไข
            </button>
          </div>
        </div>

        <p v-if="flash" class="mt-3 text-sm font-semibold text-[#0f766e]">
          {{ flash }}
        </p>
      </section>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="entry in catalogEntries"
          :key="entry.item.id"
          class="panel rounded-2xl p-4"
        >
          <div class="mb-3 flex items-start justify-between gap-3">
            <h3 class="line-clamp-2 text-lg font-bold text-[#21423b]">
              {{ entry.item.name }}
            </h3>
            <span
              class="badge-brand rounded-full px-3 py-1 text-xs font-semibold"
              >{{ entry.item.isActive ? "เปิดขาย" : "ปิดขาย" }}</span
            >
          </div>

          <div class="grid gap-3">
            <label class="field-block">
              <span class="field-label">ชื่อสินค้า</span>
              <input
                v-model="entry.draft.name"
                type="text"
                class="field-input"
              />
            </label>

            <label class="field-block">
              <span class="field-label">หมวดหมู่</span>
              <input
                v-model="entry.draft.category"
                type="text"
                class="field-input"
              />
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="field-block">
                <span class="field-label">ราคา</span>
                <input
                  v-model.number="entry.draft.price"
                  type="number"
                  min="0"
                  step="10"
                  class="field-input"
                />
              </label>

              <label class="field-block">
                <span class="field-label">เวลาเตรียม</span>
                <input
                  v-model="entry.draft.leadTime"
                  type="text"
                  class="field-input"
                />
              </label>
            </div>

            <label
              class="inline-flex items-center gap-2 text-sm text-[#21423b]"
            >
              <input
                v-model="entry.draft.isActive"
                type="checkbox"
                class="h-4 w-4 accent-[#0f766e]"
              />
              เปิดขาย
            </label>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
            <NuxtLink
              :to="`/admin/product/${entry.item.id}`"
              class="link-brand text-sm font-semibold"
              >รายละเอียดสินค้า</NuxtLink
            >
            <div class="relative">
              <button
                type="button"
                class="btn-menu rounded-xl px-3 py-2 text-xs font-semibold"
                @click.stop="toggleMenu(entry.item.id, $event)"
              >
                เมนูจัดการ
              </button>

              <ul
                v-if="openMenuId === entry.item.id"
                class="dropdown menu w-44 rounded-xl bg-white shadow-md"
                :class="{ 'dropdown-up': menuOpenUp[entry.item.id] }"
                @click.stop
              >
                <li>
                  <NuxtLink :to="`/admin/product/${entry.item.id}`" class="dropdown-item">
                    รายละเอียด
                  </NuxtLink>
                </li>
                <li>
                  <button
                    type="button"
                    class="dropdown-item"
                    @click="startEdit(entry.item.id); closeMenu()"
                  >
                    แก้ไข
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="dropdown-item danger"
                    @click="handleDelete(entry.item.id); closeMenu()"
                  >
                    ลบ
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <dialog ref="confirmDeleteDialog" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold text-[#21423b]">ยืนยันการลบสินค้า</h3>
          <p class="py-3 text-sm text-[#48645d]">
            ต้องการลบสินค้า
            <span class="font-bold text-[#21423b]">{{ pendingDeleteName }}</span>
            ใช่หรือไม่
          </p>
          <div class="modal-action">
            <form method="dialog">
              <button
                type="submit"
                class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
                @click="clearPendingDelete"
              >
                ยกเลิก
              </button>
            </form>
            <button
              type="button"
              class="btn-danger rounded-xl px-3 py-2 text-xs font-semibold"
              @click="confirmDelete"
            >
              ยืนยันลบ
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit" @click="clearPendingDelete">close</button>
        </form>
      </dialog>

      <dialog ref="confirmSaveDialog" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold text-[#21423b]">
            {{ pendingSaveAction === "edit" ? "ยืนยันการบันทึกการแก้ไข" : "ยืนยันการเพิ่มสินค้า" }}
          </h3>
          <p class="py-3 text-sm text-[#48645d]">
            {{
              pendingSaveAction === "edit"
                ? `ต้องการบันทึกการแก้ไขสินค้า ${pendingSaveName} ใช่หรือไม่`
                : `ต้องการเพิ่มสินค้า ${pendingSaveName} ใช่หรือไม่`
            }}
          </p>
          <div class="modal-action">
            <form method="dialog">
              <button
                type="submit"
                class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
                @click="clearPendingSave"
              >
                ยกเลิก
              </button>
            </form>
            <button
              type="button"
              class="btn-brand rounded-xl px-3 py-2 text-xs font-semibold"
              @click="confirmSave"
            >
              ยืนยัน
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit" @click="clearPendingSave">close</button>
        </form>
      </dialog>

      <div class="toast toast-top toast-end">
        <div v-for="toast in toasts" :key="toast.id" class="alert" :class="`alert-${toast.type}`">
          <span>{{ toast.message }}</span>
        </div>
      </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useAdminMvpStore } from "~/composables/useAdminMvpStore";

definePageMeta({
  layout: "admin",
});

type ProductDraft = {
  name: string;
  category: string;
  price: number;
  leadTime: string;
  isActive: boolean;
};

type ToastType = "success" | "info" | "warning";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

const {
  catalog,
  categories,
  updateCatalogItem,
  createCatalogItem,
  deleteCatalogItem,
} = useAdminMvpStore();

const flash = ref("");
const drafts = reactive<Record<string, ProductDraft>>({});
const confirmDeleteDialog = ref<HTMLDialogElement | null>(null);
const confirmSaveDialog = ref<HTMLDialogElement | null>(null);
const pendingDeleteId = ref<string | null>(null);
const pendingDeleteName = ref("");
const pendingSaveAction = ref<"create" | "edit" | null>(null);
const pendingSaveName = ref("");
const toasts = ref<ToastItem[]>([]);
const openMenuId = ref<string | null>(null);
const editingProductId = ref<string | null>(null);
const menuOpenUp = reactive<Record<string, boolean>>({});
const isCategoryMenuOpen = ref(false);
let toastSeed = 0;

const newItem = reactive<ProductDraft>({
  name: "",
  category: "",
  price: 0,
  leadTime: "",
  isActive: true,
});

const categorySuggestions = computed(() =>
  categories.value.map((item) => item.name),
);

const catalogEntries = computed(() =>
  catalog.value
    .map((item) => ({
      item,
      draft: drafts[item.id],
    }))
    .filter(
      (
        entry,
      ): entry is {
        item: (typeof catalog.value)[number];
        draft: ProductDraft;
      } => Boolean(entry.draft),
    ),
);

const resetNewItem = () => {
  newItem.name = "";
  newItem.category = categorySuggestions.value[0] ?? "";
  newItem.price = 0;
  newItem.leadTime = "";
  newItem.isActive = true;
};

const cancelEdit = () => {
  editingProductId.value = null;
  resetNewItem();
};

const showToast = (type: ToastType, message: string) => {
  const id = ++toastSeed;
  flash.value = message;
  toasts.value = [...toasts.value, { id, type, message }];

  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, 2600);
};

const clearPendingDelete = () => {
  pendingDeleteId.value = null;
  pendingDeleteName.value = "";
};

const clearPendingSave = () => {
  pendingSaveAction.value = null;
  pendingSaveName.value = "";
};

const closeMenu = () => {
  openMenuId.value = null;
};

const toggleMenu = (id: string, event: MouseEvent) => {
  if (openMenuId.value === id) {
    closeMenu();
    return;
  }

  const button = event.currentTarget as HTMLElement | null;
  const rect = button?.getBoundingClientRect();
  const minSpaceForMenu = 190;
  menuOpenUp[id] = rect ? window.innerHeight - rect.bottom < minSpaceForMenu : false;
  openMenuId.value = openMenuId.value === id ? null : id;
};

const toggleCategoryMenu = () => {
  isCategoryMenuOpen.value = !isCategoryMenuOpen.value;
};

const selectCategory = (category: string) => {
  newItem.category = category;
  isCategoryMenuOpen.value = false;
};

const handleWindowClick = () => {
  closeMenu();
  isCategoryMenuOpen.value = false;
};

onMounted(() => {
  window.addEventListener("click", handleWindowClick);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", handleWindowClick);
});

watch(
  catalog,
  (items) => {
    for (const item of items) {
      drafts[item.id] = {
        name: item.name,
        category: item.category,
        price: item.price,
        leadTime: item.leadTime,
        isActive: item.isActive,
      };
    }

    for (const id of Object.keys(drafts)) {
      if (!items.some((item) => item.id === id)) {
        delete drafts[id];
        delete menuOpenUp[id];
      }
    }

    if (!newItem.category) {
      newItem.category = categorySuggestions.value[0] ?? "";
    }
  },
  { immediate: true, deep: true },
);

const requestCreateOrUpdate = () => {
  if (!newItem.name.trim()) {
    showToast("warning", "กรุณาระบุชื่อสินค้า");
    return;
  }

  if (!newItem.category.trim()) {
    showToast("warning", "กรุณาระบุหมวดหมู่สินค้า");
    return;
  }

  pendingSaveAction.value = editingProductId.value ? "edit" : "create";
  pendingSaveName.value = newItem.name.trim();
  confirmSaveDialog.value?.showModal();
};

const confirmSave = () => {
  const action = pendingSaveAction.value;
  if (!action) return;

  clearPendingSave();
  confirmSaveDialog.value?.close();

  if (action === "edit" && editingProductId.value) {
    const success = updateCatalogItem(editingProductId.value, {
      name: newItem.name,
      category: newItem.category,
      price: Number.isFinite(newItem.price) ? Math.max(0, newItem.price) : 0,
      leadTime: newItem.leadTime,
      isActive: newItem.isActive,
    });

    showToast(
      success ? "success" : "info",
      success ? "บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว" : "ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข",
    );

    if (success) {
      cancelEdit();
    }
    return;
  }

  const created = createCatalogItem({
    name: newItem.name,
    category: newItem.category,
    price: newItem.price,
    leadTime: newItem.leadTime,
    isActive: newItem.isActive,
  });

  showToast("success", `เพิ่มสินค้า ${created.name} เรียบร้อยแล้ว`);
  resetNewItem();
};

const startEdit = (id: string) => {
  const source = catalog.value.find((item) => item.id === id);
  if (!source) {
    showToast("info", "ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข");
    return;
  }

  editingProductId.value = id;
  newItem.name = source.name;
  newItem.category = source.category;
  newItem.price = source.price;
  newItem.leadTime = source.leadTime;
  newItem.isActive = source.isActive;

  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("info", `โหลดข้อมูล ${source.name} สำหรับแก้ไขแล้ว`);
};

const handleDelete = (id: string) => {
  const current = catalog.value.find((item) => item.id === id);
  if (!current) {
    return;
  }

  pendingDeleteId.value = current.id;
  pendingDeleteName.value = current.name;
  confirmDeleteDialog.value?.showModal();
};

const confirmDelete = () => {
  const targetId = pendingDeleteId.value;
  const targetName = pendingDeleteName.value;
  if (!targetId) {
    return;
  }

  const deleted = deleteCatalogItem(targetId);
  clearPendingDelete();
  confirmDeleteDialog.value?.close();
  showToast(
    deleted ? "success" : "info",
    deleted
      ? `ลบสินค้า ${targetName} เรียบร้อยแล้ว`
      : "ไม่สามารถลบสินค้าได้",
  );
};
</script>

<style scoped>
.admin-page {
  background:
    radial-gradient(circle at 95% 0%, rgba(6, 95, 70, 0.12), transparent 32%),
    #f8f5f0;
}

.panel {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(6, 95, 70, 0.14);
}

.field-block {
  display: grid;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #49625b;
  letter-spacing: 0.02em;
}

.field-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.96);
  padding: 0.55rem 0.75rem;
  color: #1f3d36;
}

.field-input:focus {
  border-color: rgba(15, 118, 110, 0.6);
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
}

.btn-brand {
  color: #fff;
  background: linear-gradient(120deg, #0f766e, #065f46);
}

.btn-brand:hover {
  filter: brightness(1.06);
}

.btn-ghost {
  color: #065f46;
  border: 1px solid rgba(6, 95, 70, 0.2);
  background: rgba(255, 255, 255, 0.86);
}

.btn-ghost:hover {
  background: #065f46;
  color: #fff;
}

.btn-menu {
  color: #0f766e;
  border: 1px solid rgba(15, 118, 110, 0.28);
  background: rgba(240, 253, 250, 0.95);
}

.btn-menu:hover {
  color: #fff;
  border-color: #0f766e;
  background: #0f766e;
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

.badge-brand {
  color: #065f46;
  border: 1px solid rgba(5, 150, 105, 0.24);
  background: rgba(5, 150, 105, 0.12);
}

.link-brand {
  color: #0f766e;
}

.link-brand:hover {
  color: #115e59;
  text-decoration: underline;
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 20;
  border: 1px solid rgba(6, 95, 70, 0.14);
  padding: 0.35rem;
  list-style: none;
}

.dropdown-up {
  top: auto;
  bottom: calc(100% + 0.35rem);
}

.dropdown-full {
  left: 0;
  right: 0;
}

.field-dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.field-dropdown-btn::after {
  content: "▾";
  margin-left: 0.5rem;
  color: #4b6861;
  font-size: 0.72rem;
}

.dropdown-item {
  display: block;
  width: 100%;
  border-radius: 0.6rem;
  padding: 0.45rem 0.65rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #21423b;
}

.dropdown-item:hover {
  background: rgba(6, 95, 70, 0.1);
}

.dropdown-item.danger {
  color: #9f1239;
}

.dropdown-item.danger:hover {
  background: rgba(225, 29, 72, 0.1);
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
  width: min(92vw, 26rem);
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

.toast {
  position: fixed;
  z-index: 60;
  display: grid;
  gap: 0.55rem;
}

.toast-top {
  top: 1rem;
}

.toast-end {
  right: 1rem;
}

.alert {
  min-width: 14rem;
  max-width: min(86vw, 22rem);
  border-radius: 0.85rem;
  border: 1px solid transparent;
  padding: 0.65rem 0.85rem;
  font-size: 0.84rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
}

.alert-info {
  color: #0f3d35;
  border-color: rgba(13, 148, 136, 0.28);
  background: rgba(204, 251, 241, 0.96);
}

.alert-success {
  color: #064e3b;
  border-color: rgba(22, 163, 74, 0.28);
  background: rgba(220, 252, 231, 0.96);
}

.alert-warning {
  color: #7c2d12;
  border-color: rgba(234, 88, 12, 0.3);
  background: rgba(255, 237, 213, 0.96);
}
</style>
