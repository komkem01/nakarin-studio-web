export type AdminToastType = 'success' | 'info' | 'warning' | 'error'

type AdminToastItem = {
  id: number
  type: AdminToastType
  message: string
  visible: boolean
}

const LEAVE_DURATION_MS = 260

export const useAdminToast = () => {
  const toasts = useState<AdminToastItem[]>('admin-toast-items', () => [])
  const toastSeed = useState<number>('admin-toast-seed', () => 0)

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  const hideToast = (id: number) => {
    const target = toasts.value.find((item) => item.id === id)
    if (!target || !target.visible) return

    target.visible = false

    if (import.meta.client) {
      window.setTimeout(() => {
        removeToast(id)
      }, LEAVE_DURATION_MS)
    } else {
      removeToast(id)
    }
  }

  const showToast = (type: AdminToastType, message: string, duration = 2800) => {
    const id = ++toastSeed.value
    const toast: AdminToastItem = {
      id,
      type,
      message,
      visible: false
    }

    toasts.value = [...toasts.value, toast]

    if (import.meta.client) {
      window.requestAnimationFrame(() => {
        const target = toasts.value.find((item) => item.id === id)
        if (target) {
          target.visible = true
        }
      })

      window.setTimeout(() => {
        hideToast(id)
      }, duration)
    } else {
      hideToast(id)
    }
  }

  return {
    toasts,
    showToast,
    hideToast
  }
}
