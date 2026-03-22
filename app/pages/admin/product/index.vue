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
                {{ selectedCategoryName(newItem.categoryId) || "เลือกหมวดหมู่" }}
              </button>
              <ul
                v-if="isCategoryMenuOpen"
                class="dropdown dropdown-full menu rounded-xl bg-white shadow-md"
                @click.stop
              >
                <li v-for="category in categorySuggestions" :key="category.id">
                  <button
                    type="button"
                    class="dropdown-item"
                    @click="selectCategory(category.id)"
                  >
                    {{ category.name }}
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

        <div class="mt-3 grid gap-3 md:grid-cols-2">
          <label class="field-block md:col-span-2">
            <span class="field-label">รายละเอียดสินค้า</span>
            <textarea
              v-model="newItem.description"
              rows="3"
              class="field-input resize-none"
              placeholder="ระบุภาพรวมสินค้าโดยย่อ"
            ></textarea>
          </label>

          <label class="field-block">
            <span class="field-label">เหมาะกับงาน</span>
            <input
              v-model="newItem.suitableFor"
              type="text"
              class="field-input"
              placeholder="เช่น งานครอบครัว 30-80 คน"
            />
          </label>

          <label class="field-block">
            <span class="field-label">หน้างาน</span>
            <input
              v-model="newItem.onSite"
              type="text"
              class="field-input"
              placeholder="เช่น ส่งงานตรงเวลา + ตรวจความเรียบร้อย"
            />
          </label>
        </div>

        <div class="mt-3 grid gap-3 md:grid-cols-2">
          <label class="field-block">
            <span class="field-label">รายการที่ได้รับ</span>
            <textarea
              v-model="newItem.receivedItems"
              rows="4"
              class="field-input resize-none"
              placeholder="หนึ่งรายการต่อหนึ่งบรรทัด"
            ></textarea>
          </label>

          <label class="field-block">
            <span class="field-label">หมายเหตุสำหรับลูกค้า</span>
            <textarea
              v-model="newItem.note"
              rows="4"
              class="field-input resize-none"
              placeholder="เช่น สินค้าทำมือ อาจแตกต่างเล็กน้อย"
            ></textarea>
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
              <select v-model="entry.draft.categoryId" class="field-input">
                <option value="">เลือกหมวดหมู่</option>
                <option v-for="category in categorySuggestions" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
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

      <div v-if="isDeleteModalOpen" class="confirm-overlay" @click.self="closeDeleteModal">
        <div class="confirm-box">
          <h3 class="text-lg font-bold text-[#21423b]">ยืนยันการลบสินค้า</h3>
          <p class="py-3 text-sm text-[#48645d]">
            ต้องการลบสินค้า
            <span class="font-bold text-[#21423b]">{{ pendingDeleteName }}</span>
            ใช่หรือไม่
          </p>
          <div class="confirm-action">
            <button
              type="button"
              class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
              :disabled="isSubmitting"
              @click="closeDeleteModal"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn-danger rounded-xl px-3 py-2 text-xs font-semibold"
              :disabled="isSubmitting"
              @click="confirmDelete"
            >
              ยืนยันลบ
            </button>
          </div>
        </div>
      </div>

      <div v-if="isSaveModalOpen" class="confirm-overlay" @click.self="closeSaveModal">
        <div class="confirm-box">
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
          <div class="confirm-action">
            <button
              type="button"
              class="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
              :disabled="isSubmitting"
              @click="closeSaveModal"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn-brand rounded-xl px-3 py-2 text-xs font-semibold"
              :disabled="isSubmitting"
              @click="confirmSave"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </div>

  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

definePageMeta({
  layout: "admin",
});

type ProductApiItem = {
  id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  suitable_for?: string | null;
  on_site?: string | null;
  received_items?: string | null;
  note?: string | null;
  price: number;
  is_active: boolean;
  is_available: boolean;
  prep_time: number;
  sort_order: number;
};

type CategoryApiItem = {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
};

type ProductDraft = {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  leadTime: string;
  suitableFor: string;
  onSite: string;
  receivedItems: string;
  note: string;
  isActive: boolean;
};

const { request } = useAdminApi();
const { showToast } = useAdminToast();

const catalog = ref<ProductDraftWithId[]>([]);
const categories = ref<CategoryApiItem[]>([]);
const drafts = reactive<Record<string, ProductDraft>>({});
const isDeleteModalOpen = ref(false);
const isSaveModalOpen = ref(false);
const pendingDeleteId = ref<string | null>(null);
const pendingDeleteName = ref("");
const pendingSaveAction = ref<"create" | "edit" | null>(null);
const pendingSaveName = ref("");
const openMenuId = ref<string | null>(null);
const editingProductId = ref<string | null>(null);
const menuOpenUp = reactive<Record<string, boolean>>({});
const isCategoryMenuOpen = ref(false);
const isSubmitting = ref(false);

type ProductDraftWithId = ProductDraft & {
  id: string;
};

const newItem = reactive<ProductDraft>({
  name: "",
  categoryId: "",
  description: "",
  price: 0,
  leadTime: "",
  suitableFor: "",
  onSite: "",
  receivedItems: "",
  note: "",
  isActive: true,
});

const categorySuggestions = computed(() => categories.value);

const selectedCategoryName = (categoryId: string) => {
  if (!categoryId) return "";
  return categories.value.find((item) => item.id === categoryId)?.name || "";
};

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
        item: ProductDraftWithId;
        draft: ProductDraft;
      } => Boolean(entry.draft),
    ),
);

const toLeadTimeText = (prepTime: number): string => {
  if (!Number.isFinite(prepTime) || prepTime <= 0) return "";
  return `${prepTime} วัน`;
};

const parseLeadTime = (value: string): number => {
  const match = String(value || "").match(/\d+/);
  if (!match) return 0;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const mapApiProductToDraft = (item: ProductApiItem): ProductDraftWithId => ({
  id: item.id,
  name: item.name,
  categoryId: item.category_id || "",
  description: item.description || "",
  price: Number(item.price) || 0,
  leadTime: toLeadTimeText(item.prep_time),
  suitableFor: item.suitable_for || "",
  onSite: item.on_site || "",
  receivedItems: item.received_items || "",
  note: item.note || "",
  isActive: Boolean(item.is_active),
});

const loadProducts = async () => {
  try {
    const items = await request<ProductApiItem[]>("/api/v1/system/products", {
      method: "GET",
    });
    catalog.value = (items || []).map(mapApiProductToDraft);
  } catch {
    catalog.value = [];
    showToast("warning", "โหลดข้อมูลสินค้าไม่สำเร็จ");
  }
};

const loadCategories = async () => {
  try {
    categories.value = await request<CategoryApiItem[]>("/api/v1/system/product-categories", {
      method: "GET",
      query: { is_active: true },
    });
  } catch {
    categories.value = [];
    showToast("warning", "โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
  }
};

const resetNewItem = () => {
  newItem.name = "";
  newItem.categoryId = categorySuggestions.value[0]?.id ?? "";
  newItem.description = "";
  newItem.price = 0;
  newItem.leadTime = "";
  newItem.suitableFor = "";
  newItem.onSite = "";
  newItem.receivedItems = "";
  newItem.note = "";
  newItem.isActive = true;
};

const cancelEdit = () => {
  editingProductId.value = null;
  resetNewItem();
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

const selectCategory = (categoryId: string) => {
  newItem.categoryId = categoryId;
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
        categoryId: item.categoryId,
        description: item.description,
        price: item.price,
        leadTime: item.leadTime,
        suitableFor: item.suitableFor,
        onSite: item.onSite,
        receivedItems: item.receivedItems,
        note: item.note,
        isActive: item.isActive,
      };
    }

    for (const id of Object.keys(drafts)) {
      if (!items.some((item) => item.id === id)) {
        delete drafts[id];
        delete menuOpenUp[id];
      }
    }

    if (!newItem.categoryId) {
      newItem.categoryId = categorySuggestions.value[0]?.id ?? "";
    }
  },
  { immediate: true, deep: true },
);

const requestCreateOrUpdate = () => {
  if (isSubmitting.value) return;

  if (!newItem.name.trim()) {
    showToast("warning", "กรุณาระบุชื่อสินค้า");
    return;
  }

  if (!newItem.categoryId) {
    showToast("warning", "กรุณาระบุหมวดหมู่สินค้า");
    return;
  }

  pendingSaveAction.value = editingProductId.value ? "edit" : "create";
  pendingSaveName.value = newItem.name.trim();
  isSaveModalOpen.value = true;
};

const confirmSave = async () => {
  if (isSubmitting.value) return;

  const action = pendingSaveAction.value;
  if (!action) return;

  clearPendingSave();
  isSaveModalOpen.value = false;

  const payload = {
    category_id: newItem.categoryId,
    name: newItem.name.trim(),
    description: newItem.description.trim() || null,
    suitable_for: newItem.suitableFor.trim() || null,
    on_site: newItem.onSite.trim() || null,
    received_items: newItem.receivedItems.trim() || null,
    note: newItem.note.trim() || null,
    price: Number.isFinite(newItem.price) ? Math.max(0, newItem.price) : 0,
    is_active: newItem.isActive,
    is_available: newItem.isActive,
    prep_time: parseLeadTime(newItem.leadTime),
    sort_order: 0,
  };

  try {
    isSubmitting.value = true;

    if (action === "edit" && editingProductId.value) {
      await request<ProductApiItem>(`/api/v1/system/products/${editingProductId.value}`, {
        method: "PATCH",
        body: payload,
      });

      showToast("success", "บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว");
      cancelEdit();
    } else {
      await request<null>("/api/v1/system/products", {
        method: "POST",
        body: payload,
      });

      showToast("success", `เพิ่มสินค้า ${payload.name} เรียบร้อยแล้ว`);
      resetNewItem();
    }

    await loadProducts();
  } catch {
    showToast("warning", "ไม่สามารถบันทึกข้อมูลสินค้าได้");
  } finally {
    isSubmitting.value = false;
  }
};

const startEdit = (id: string) => {
  const source = catalog.value.find((item) => item.id === id);
  if (!source) {
    showToast("info", "ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข");
    return;
  }

  editingProductId.value = id;
  newItem.name = source.name;
  newItem.categoryId = source.categoryId;
  newItem.description = source.description;
  newItem.price = source.price;
  newItem.leadTime = source.leadTime;
  newItem.suitableFor = source.suitableFor;
  newItem.onSite = source.onSite;
  newItem.receivedItems = source.receivedItems;
  newItem.note = source.note;
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
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (isSubmitting.value) return;

  const targetId = pendingDeleteId.value;
  const targetName = pendingDeleteName.value;
  if (!targetId) {
    return;
  }

  try {
    isSubmitting.value = true;
    await request<null>(`/api/v1/system/products/${targetId}`, {
      method: "DELETE",
    });
    showToast("success", `ลบสินค้า ${targetName} เรียบร้อยแล้ว`);
    await loadProducts();
  } catch {
    showToast("warning", "ไม่สามารถลบสินค้าได้");
  } finally {
    clearPendingDelete();
    isDeleteModalOpen.value = false;
    isSubmitting.value = false;
  }
};

const closeDeleteModal = () => {
  if (isSubmitting.value) return;
  clearPendingDelete();
  isDeleteModalOpen.value = false;
};

const closeSaveModal = () => {
  if (isSubmitting.value) return;
  clearPendingSave();
  isSaveModalOpen.value = false;
};

await Promise.all([loadProducts(), loadCategories()]);
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
  width: min(92vw, 26rem);
  border-radius: 1rem;
  border: 1px solid rgba(6, 95, 70, 0.16);
  background: #fff;
  padding: 1rem;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.2);
}

.confirm-action {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

</style>
