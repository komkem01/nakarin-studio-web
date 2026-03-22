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
                <div v-if="isPackageLoading" class="rounded-2xl border border-[rgba(6,95,70,0.14)] bg-white/75 p-6 text-sm text-[#4f6660]">
                    กำลังโหลดแพ็กเกจจากระบบ...
                </div>

                <div v-else-if="packageLoadError" class="rounded-2xl border border-[#f3c6c6] bg-[#fff6f6] p-6 text-sm text-[#9b2c2c]">
                    {{ packageLoadError }}
                </div>

                <div v-else-if="packages.length === 0" class="rounded-2xl border border-[rgba(6,95,70,0.14)] bg-white/75 p-6 text-sm text-[#4f6660]">
                    ยังไม่มีข้อมูลแพ็กเกจในระบบ
                </div>

                <div v-else class="space-y-4">
                    <article
                        v-for="item in packages"
                        :key="item.id"
                        class="package-card rounded-2xl p-5"
                        :class="selectedPackageId === item.id ? 'ring-2 ring-[#059669]' : ''"
                    >
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
                            <div class="flex items-center gap-3">
                                <NuxtLink :to="`/customer/booking/${item.slug}`" class="link-brand text-sm font-semibold">
                                    ดูรายละเอียด
                                </NuxtLink>
                                <button
                                    type="button"
                                    class="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold"
                                    @click="selectedPackageId = item.id"
                                >
                                    เลือกแพ็กเกจนี้
                                </button>
                            </div>
                        </div>
                    </article>
                </div>

                <form class="form-card rounded-2xl p-5 md:p-6" @submit.prevent="handleSubmit">
                    <h3 class="font-display text-2xl">รายละเอียดการจอง</h3>
                    <p class="mt-1 text-sm text-[#4f6660]">กรอกข้อมูลผู้จองและที่อยู่ให้ครบ เพื่อให้ทีมงานยืนยันคิวและรายละเอียดได้เร็วขึ้น</p>

                    <div class="mt-5 space-y-4">
                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">แพ็กเกจที่ต้องการจอง</span>
                            <select v-model="selectedPackageId" class="field" :disabled="isPackageLoading || packages.length === 0">
                                <option value="">เลือกแพ็กเกจ</option>
                                <option v-for="item in packages" :key="item.id" :value="item.id">
                                    {{ item.name }} ({{ item.price }})
                                </option>
                            </select>
                        </label>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">เพศ</span>
                                <select v-model="bookingForm.genderId" class="field">
                                    <option value="">เลือกเพศ</option>
                                    <option v-for="gender in genders" :key="gender.id" :value="gender.id">
                                        {{ gender.name }}
                                    </option>
                                </select>
                            </label>

                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">คำนำหน้า</span>
                                <select v-model="bookingForm.prefixId" class="field" :disabled="!bookingForm.genderId">
                                    <option value="">เลือกคำนำหน้า</option>
                                    <option v-for="prefix in prefixes" :key="prefix.id" :value="prefix.id">
                                        {{ prefix.name }}
                                    </option>
                                </select>
                            </label>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">ชื่อ</span>
                                <input v-model="bookingForm.firstName" type="text" placeholder="เช่น พิมพ์ชนก" class="field" />
                            </label>

                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">สกุล</span>
                                <input v-model="bookingForm.lastName" type="text" placeholder="เช่น สุวรรณ" class="field" />
                            </label>
                        </div>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">เบอร์โทรศัพท์</span>
                            <input v-model="bookingForm.phone" type="tel" placeholder="08x-xxx-xxxx" class="field" />
                        </label>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">บ้านเลขที่</span>
                                <input v-model="bookingForm.houseNo" type="text" placeholder="เช่น 99/12" class="field" />
                            </label>

                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">หมู่</span>
                                <input v-model="bookingForm.village" type="text" placeholder="เช่น หมู่ 4" class="field" />
                            </label>
                        </div>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">ถนน</span>
                            <input v-model="bookingForm.road" type="text" placeholder="เช่น ถนนมิตรภาพ" class="field" />
                        </label>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">จังหวัด</span>
                                <select v-model="bookingForm.provinceId" class="field">
                                    <option value="">เลือกจังหวัด</option>
                                    <option v-for="province in provinces" :key="province.id" :value="province.id">
                                        {{ province.name }}
                                    </option>
                                </select>
                            </label>

                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">อำเภอ</span>
                                <select v-model="bookingForm.districtId" class="field" :disabled="!bookingForm.provinceId">
                                    <option value="">เลือกอำเภอ</option>
                                    <option v-for="district in districts" :key="district.id" :value="district.id">
                                        {{ district.name }}
                                    </option>
                                </select>
                            </label>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">ตำบล</span>
                                <select v-model="bookingForm.subDistrictId" class="field" :disabled="!bookingForm.districtId">
                                    <option value="">เลือกตำบล</option>
                                    <option v-for="subDistrict in subDistricts" :key="subDistrict.id" :value="subDistrict.id">
                                        {{ subDistrict.name }}
                                    </option>
                                </select>
                            </label>

                            <label class="block">
                                <span class="mb-1 block text-sm font-medium text-[#36524b]">เลขไปรษณีย์</span>
                                <select v-model="bookingForm.zipcodeId" class="field" :disabled="!bookingForm.subDistrictId">
                                    <option value="">เลือกไปรษณีย์</option>
                                    <option v-for="zipcode in zipcodes" :key="zipcode.id" :value="zipcode.id">
                                        {{ zipcode.name }}
                                    </option>
                                </select>
                            </label>
                        </div>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">วันที่ใช้งาน</span>
                            <input v-model="bookingForm.date" type="date" class="field" />
                        </label>

                        <label class="block">
                            <span class="mb-1 block text-sm font-medium text-[#36524b]">รายละเอียดเพิ่มเติม</span>
                            <textarea v-model="bookingForm.note" rows="4" placeholder="โทนสีที่ต้องการ สถานที่จัดงาน หรือข้อมูลสำคัญอื่นๆ" class="field resize-none"></textarea>
                        </label>
                    </div>

                    <button type="submit" :disabled="isSubmitting" class="btn-primary mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70">
                        ส่งข้อมูลเพื่อเช็กคิว
                    </button>

                    <p v-if="submitError" class="mt-3 text-sm text-[#9b2c2c]">
                        {{ submitError }}
                    </p>
                </form>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { generateReferenceNo, normalizePhone } from '~/data/customer-tracking'
import { usePublicBookingApi } from '~/composables/usePublicBookingApi'

const {
    createAggregateBooking,
    listProducts,
    listGenders,
    listPrefixes,
    listProvinces,
    listDistricts,
    listSubDistricts,
    listZipcodes
} = usePublicBookingApi()

type PackageCard = {
    id: string
    slug: string
    type: string
    name: string
    detail: string
    price: string
    unitPrice: number
}

const packageSlugs = ['mongkol-standard', 'phaya-naga', 'executive-welcome']
const packages = ref<PackageCard[]>([])
const selectedPackageId = ref('')
const isPackageLoading = ref(true)
const packageLoadError = ref('')

const bookingForm = reactive({
    genderId: '',
    prefixId: '',
    firstName: '',
    lastName: '',
    phone: '',
    houseNo: '',
    village: '',
    road: '',
    provinceId: '',
    districtId: '',
    subDistrictId: '',
    zipcodeId: '',
    date: '',
    note: ''
})

const genders = ref<Array<{ id: string; name: string }>>([])
const prefixes = ref<Array<{ id: string; name: string }>>([])
const provinces = ref<Array<{ id: string; name: string }>>([])
const districts = ref<Array<{ id: string; name: string }>>([])
const subDistricts = ref<Array<{ id: string; name: string }>>([])
const zipcodes = ref<Array<{ id: string; name: string }>>([])
const isSubmitting = ref(false)
const submitError = ref('')

const selectedGenderName = computed(() => genders.value.find((item) => item.id === bookingForm.genderId)?.name || '')
const selectedPrefixName = computed(() => prefixes.value.find((item) => item.id === bookingForm.prefixId)?.name || '')
const selectedProvinceName = computed(() => provinces.value.find((item) => item.id === bookingForm.provinceId)?.name || '')
const selectedDistrictName = computed(() => districts.value.find((item) => item.id === bookingForm.districtId)?.name || '')
const selectedSubDistrictName = computed(() => subDistricts.value.find((item) => item.id === bookingForm.subDistrictId)?.name || '')
const selectedZipcode = computed(() => zipcodes.value.find((item) => item.id === bookingForm.zipcodeId)?.name || '')
const selectedPackage = computed(() => packages.value.find((item) => item.id === selectedPackageId.value) || null)

const loadGenders = async () => {
    try {
        const items = await listGenders()
        genders.value = items.map((item) => ({ id: item.id, name: item.name }))
    } catch {
        genders.value = []
    }
}

const loadPrefixes = async (genderId?: string) => {
    try {
        const items = await listPrefixes(genderId)
        prefixes.value = items.map((item) => ({ id: item.id, name: item.name }))
    } catch {
        prefixes.value = []
    }
}

const loadProvinces = async () => {
    try {
        const items = await listProvinces()
        provinces.value = items.map((item) => ({ id: item.id, name: item.name }))
    } catch {
        provinces.value = []
    }
}

const loadDistricts = async (provinceId: string) => {
    if (!provinceId) {
        districts.value = []
        return
    }

    try {
        const items = await listDistricts(provinceId)
        districts.value = items.map((item) => ({ id: item.id, name: item.name }))
    } catch {
        districts.value = []
    }
}

const loadSubDistricts = async (districtId: string) => {
    if (!districtId) {
        subDistricts.value = []
        return
    }

    try {
        const items = await listSubDistricts(districtId)
        subDistricts.value = items.map((item) => ({ id: item.id, name: item.name }))
    } catch {
        subDistricts.value = []
    }
}

const loadZipcodes = async (subDistrictId: string) => {
    if (!subDistrictId) {
        zipcodes.value = []
        return
    }

    try {
        const items = await listZipcodes(subDistrictId)
        zipcodes.value = items.map((item) => ({ id: item.id, name: item.name }))
    } catch {
        zipcodes.value = []
    }
}

const formatPrice = (price: number) => {
    return `เริ่มต้น ${price.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })}`
}

const loadPackages = async () => {
    isPackageLoading.value = true
    packageLoadError.value = ''

    try {
        const items = await listProducts()
        packages.value = items
            .sort((a, b) => a.sort_order - b.sort_order)
            .slice(0, 3)
            .map((item, index) => ({
                id: item.id,
                slug: packageSlugs[index] || item.id,
                type: 'แพ็กเกจงานบายศรี',
                name: item.name,
                detail: item.description || 'ไม่มีรายละเอียดเพิ่มเติม',
                price: formatPrice(item.price),
                unitPrice: item.price
            }))

        const firstPackage = packages.value[0]
        if (firstPackage) {
            selectedPackageId.value = firstPackage.id
        }
    } catch {
        packages.value = []
        selectedPackageId.value = ''
        packageLoadError.value = 'ไม่สามารถโหลดแพ็กเกจจริงจากระบบได้ในขณะนี้'
    } finally {
        isPackageLoading.value = false
    }
}

watch(
    () => bookingForm.genderId,
    async (genderId) => {
        bookingForm.prefixId = ''
        await loadPrefixes(genderId || undefined)
    }
)

watch(
    () => bookingForm.provinceId,
    async (provinceId) => {
        bookingForm.districtId = ''
        bookingForm.subDistrictId = ''
        bookingForm.zipcodeId = ''
        subDistricts.value = []
        zipcodes.value = []
        await loadDistricts(provinceId)
    }
)

watch(
    () => bookingForm.districtId,
    async (districtId) => {
        bookingForm.subDistrictId = ''
        bookingForm.zipcodeId = ''
        zipcodes.value = []
        await loadSubDistricts(districtId)
    }
)

watch(
    () => bookingForm.subDistrictId,
    async (subDistrictId) => {
        bookingForm.zipcodeId = ''
        await loadZipcodes(subDistrictId)
    }
)

onMounted(async () => {
    await loadPackages()
    await loadGenders()
    await loadPrefixes()
    await loadProvinces()
})

const handleSubmit = async () => {
    if (isSubmitting.value) return
    if (!selectedPackage.value) {
        submitError.value = 'กรุณาเลือกแพ็กเกจที่ต้องการจอง'
        return
    }

    const referenceNo = generateReferenceNo()
    const phone = normalizePhone(bookingForm.phone)
    const firstName = bookingForm.firstName.trim() || 'ลูกค้า'
    const lastName = bookingForm.lastName.trim() || ''

    const profileNote = [
        selectedGenderName.value ? `เพศ: ${selectedGenderName.value}` : '',
        selectedPrefixName.value ? `คำนำหน้า: ${selectedPrefixName.value}` : '',
        selectedProvinceName.value ? `จังหวัด: ${selectedProvinceName.value}` : '',
        selectedDistrictName.value ? `อำเภอ: ${selectedDistrictName.value}` : '',
        selectedSubDistrictName.value ? `ตำบล: ${selectedSubDistrictName.value}` : '',
        selectedZipcode.value ? `ไปรษณีย์: ${selectedZipcode.value}` : ''
    ].filter(Boolean).join(' | ')

    const customerNote = [
        profileNote,
        bookingForm.note.trim()
    ].filter(Boolean).join(' | ')

    submitError.value = ''
    isSubmitting.value = true

    try {
        await createAggregateBooking({
            booking: {
                booking_no: referenceNo,
                delivery_phone: phone,
                delivery_first_name: firstName,
                delivery_last_name: lastName || undefined,
                delivery_no: bookingForm.houseNo.trim() || undefined,
                delivery_village: bookingForm.village.trim() || undefined,
                delivery_street: bookingForm.road.trim() || undefined,
                delivery_province_id: bookingForm.provinceId || undefined,
                delivery_district_id: bookingForm.districtId || undefined,
                delivery_sub_district_id: bookingForm.subDistrictId || undefined,
                delivery_zipcode_id: bookingForm.zipcodeId || undefined,
                internal_note: customerNote || undefined,
                delivery_note: bookingForm.date ? `วันที่ใช้งาน: ${bookingForm.date}` : undefined
            },
            detail: {
                first_name: firstName,
                last_name: lastName || undefined,
                phone
            },
            items: [
                {
                    product_id: selectedPackage.value.id,
                    product_name: selectedPackage.value.name,
                    unit_price_at_booking: selectedPackage.value.unitPrice,
                    quantity: 1,
                    line_total: selectedPackage.value.unitPrice,
                    note: bookingForm.note.trim() || undefined
                }
            ]
        })

        await navigateTo({
            path: '/customer/confirm',
            query: {
                ref: referenceNo,
                phone,
                type: 'booking',
                item: selectedPackage.value.name
            }
        })
    } catch {
        submitError.value = 'ไม่สามารถส่งคำขอได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'
    } finally {
        isSubmitting.value = false
    }
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