<template>
  <div class="min-h-screen bg-[#f8f5f0] flex items-center justify-center p-4 selection:bg-emerald-200">
    <div
      v-if="toast.visible"
      class="fixed right-4 top-4 z-[100] min-w-[280px] max-w-[360px] rounded-xl border px-4 py-3 text-sm shadow-xl"
      :class="toast.type === 'success'
        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
        : 'border-red-300 bg-red-50 text-red-900'"
    >
      {{ toast.message }}
    </div>

    <div class="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
      <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-800 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-600 rounded-full blur-[120px]"></div>
    </div>

    <div class="relative w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
      <div class="w-full md:w-1/2 bg-emerald-900 relative p-10 md:p-12 flex flex-col justify-between text-white overflow-hidden">
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="thaiPattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="white" stroke-width="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#thaiPattern)" />
          </svg>
        </div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
                <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0A4.5 4.5 0 1 1 12 16.5M16.5 12H12m-4.5 0A4.5 4.5 0 1 0 12 16.5M7.5 12H12m0 0v4.5" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold tracking-tight">Nakarin Studio</h1>
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-light leading-tight">นครินทร์ สตูดิโอ</h2>
            <p class="text-amber-400 font-medium italic text-lg">"ประณีตศิลป์ บายศรี และเครื่องสักการะ"</p>
          </div>
        </div>

        <div class="relative z-10 mt-8 md:mt-0">
          <p class="text-emerald-200/70 text-sm leading-relaxed max-w-xs">
            ระบบจัดการหลังบ้านสำหรับทีมงานเท่านั้น
          </p>
        </div>

        <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-emerald-700/50 to-amber-600/30 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full md:w-1/2 p-8 md:p-16 bg-white">
        <div class="max-w-sm mx-auto">
          <div class="mb-10 text-center md:text-left">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">เข้าสู่ระบบแอดมิน</h3>
            <p class="text-gray-500 text-sm">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบจัดการร้าน</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 block ml-1">ชื่อผู้ใช้งาน</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  v-model="authForm.username"
                  type="text"
                  required
                  class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Username"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center ml-1">
                <label class="text-sm font-medium text-gray-700">รหัสผ่าน</label>
              </div>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  v-model="authForm.password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  required
                  class="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Password"
                />
                <button
                  type="button"
                  @click="isPasswordVisible = !isPasswordVisible"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg v-if="isPasswordVisible" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 14.12 14.12"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <template v-if="isSubmitting">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>กำลังเข้าสู่ระบบ...</span>
              </template>
              <template v-else>
                <span>เข้าสู่ระบบ</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </template>
            </button>

            <p v-if="submitError" class="text-sm text-red-600 text-center">
              {{ submitError }}
            </p>
          </form>

          <div class="mt-12 text-center">
            <p class="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
              &copy; {{ currentYear }} Nakarin Studio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'

type LoginSuccessPayload = {
  access_token: string
  refresh_token: string
  admin_id: string
  username: string
  role: string
}

type ApiResponse<T> = {
  code: string
  message: string
  data: T
}

const authForm = reactive({
  username: '',
  password: ''
})

const isPasswordVisible = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const currentYear = computed(() => new Date().getFullYear())
const config = useRuntimeConfig()
const apiPrefix = '/api/v1'
const baseURL = String(config.public.apiBase || '').replace(/\/+$/, '')
const loginPath = baseURL.endsWith(apiPrefix) ? '/admins/login' : '/api/v1/admins/login'

const toast = reactive({
  visible: false,
  type: 'success' as 'success' | 'error',
  message: ''
})
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, type: 'success' | 'error', duration = 2200) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.visible = true
  toast.type = type
  toast.message = message

  toastTimer = setTimeout(() => {
    toast.visible = false
  }, duration)
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

const adminSession = useCookie<string | null>('admin_session', {
  sameSite: 'lax',
  secure: !import.meta.dev
})
const adminAccessToken = useCookie<string | null>('admin_access_token', {
  sameSite: 'lax',
  secure: !import.meta.dev,
  maxAge: 2 * 60 * 60
})
const adminRefreshToken = useCookie<string | null>('admin_refresh_token', {
  sameSite: 'lax',
  secure: !import.meta.dev,
  maxAge: 30 * 24 * 60 * 60
})

const handleLogin = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const response = await $fetch<ApiResponse<LoginSuccessPayload>>(loginPath, {
      method: 'POST',
      baseURL,
      body: {
        username: authForm.username.trim(),
        password: authForm.password
      }
    })

    const payload = response.data
    if (!payload?.access_token || !payload?.refresh_token) {
      throw new Error('invalid-login-response')
    }

    adminAccessToken.value = payload.access_token
    adminRefreshToken.value = payload.refresh_token
    adminSession.value = 'active'
    showToast('เข้าสู่ระบบสำเร็จ', 'success', 900)
    await new Promise((resolve) => setTimeout(resolve, 300))
    await navigateTo('/admin/dashboard')
  } catch {
    adminAccessToken.value = null
    adminRefreshToken.value = null
    adminSession.value = null
    submitError.value = 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน'
    showToast('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้หรือรหัสผ่าน', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@200;400;500;700&display=swap');

.font-sans {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
