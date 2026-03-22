import type { AdminBooking, AdminCatalogItem, AdminCategory, AdminOrder } from '~/data/admin-mvp'
import { adminBookings, adminCatalog, adminCategories, adminOrders } from '~/data/admin-mvp'

type StatusHistory = {
  at: string
  by: string
  from: string
  to: string
  note: string
}

const nowLabel = (): string => {
  return new Date().toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const cloneOrders = (): AdminOrder[] => adminOrders.map((item) => ({ ...item }))
const cloneBookings = (): AdminBooking[] => adminBookings.map((item) => ({ ...item }))
const cloneCatalog = (): AdminCatalogItem[] => adminCatalog.map((item) => ({ ...item }))
const cloneCategories = (): AdminCategory[] => adminCategories.map((item) => ({ ...item }))

const createOrderId = () => `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`
const createBookingId = () => `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`
const createCatalogId = () => `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`
const createCategoryId = () => `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const toAmount = (budget: string): number => {
  const digits = budget.replace(/,/g, '').match(/\d+/g)
  if (!digits || digits.length === 0) return 0
  const first = Number(digits[0])
  return Number.isFinite(first) ? first : 0
}

const initialOrderHistory = (): Record<string, StatusHistory[]> => {
  return Object.fromEntries(
    adminOrders.map((item) => [
      item.id,
      [
        {
          at: nowLabel(),
          by: 'System',
          from: '-',
          to: item.status,
          note: 'สร้างรายการในระบบ'
        }
      ]
    ])
  )
}

const initialBookingHistory = (): Record<string, StatusHistory[]> => {
  return Object.fromEntries(
    adminBookings.map((item) => [
      item.id,
      [
        {
          at: nowLabel(),
          by: 'System',
          from: '-',
          to: item.status,
          note: 'สร้างรายการในระบบ'
        }
      ]
    ])
  )
}

export const useAdminMvpStore = () => {
  const orders = useState<AdminOrder[]>('admin-mvp-orders', cloneOrders)
  const bookings = useState<AdminBooking[]>('admin-mvp-bookings', cloneBookings)
  const catalog = useState<AdminCatalogItem[]>('admin-mvp-catalog', cloneCatalog)
  const categories = useState<AdminCategory[]>('admin-mvp-categories', cloneCategories)

  const orderHistory = useState<Record<string, StatusHistory[]>>(
    'admin-mvp-order-history',
    initialOrderHistory
  )

  const bookingHistory = useState<Record<string, StatusHistory[]>>(
    'admin-mvp-booking-history',
    initialBookingHistory
  )

  const updateOrderStatus = (
    id: string,
    nextStatus: AdminOrder['status'],
    by = 'Admin',
    note = 'อัปเดตจากหน้ารายละเอียดคำสั่งซื้อ'
  ): boolean => {
    const target = orders.value.find((item) => item.id === id)
    if (!target || target.status === nextStatus) return false

    const prevStatus = target.status
    target.status = nextStatus

    if (!orderHistory.value[id]) orderHistory.value[id] = []
    orderHistory.value[id].unshift({
      at: nowLabel(),
      by,
      from: prevStatus,
      to: nextStatus,
      note
    })

    orders.value = [...orders.value]
    orderHistory.value = { ...orderHistory.value }
    return true
  }

  const updateBookingStatus = (
    id: string,
    nextStatus: AdminBooking['status'],
    by = 'Admin',
    note = 'อัปเดตจากหน้ารายละเอียดการจอง'
  ): boolean => {
    const target = bookings.value.find((item) => item.id === id)
    if (!target || target.status === nextStatus) return false

    const prevStatus = target.status
    target.status = nextStatus

    if (!bookingHistory.value[id]) bookingHistory.value[id] = []
    bookingHistory.value[id].unshift({
      at: nowLabel(),
      by,
      from: prevStatus,
      to: nextStatus,
      note
    })

    bookings.value = [...bookings.value]
    bookingHistory.value = { ...bookingHistory.value }
    return true
  }

  const createBookingRequest = (payload: {
    customerName: string
    phone: string
    packageName: string
    eventDate: string
    budget: string
    referenceNo: string
    note?: string
  }): AdminBooking => {
    const created: AdminBooking = {
      id: createBookingId(),
      referenceNo: payload.referenceNo,
      customerName: payload.customerName,
      phone: payload.phone,
      packageName: payload.packageName,
      eventDate: payload.eventDate,
      budget: payload.budget,
      status: 'รอยืนยัน'
    }

    bookings.value = [created, ...bookings.value]
    bookingHistory.value[created.id] = [
      {
        at: nowLabel(),
        by: 'Customer',
        from: '-',
        to: created.status,
        note: payload.note?.trim() || 'ลูกค้าส่งคำขอจองสินค้า/บริการ'
      }
    ]
    bookingHistory.value = { ...bookingHistory.value }
    return created
  }

  const confirmBookingToOrder = (id: string, by = 'Admin'): string | null => {
    const target = bookings.value.find((item) => item.id === id)
    if (!target) return null
    if (target.convertedOrderId) return target.convertedOrderId

    const existing = orders.value.find((item) => item.referenceNo === target.referenceNo)
    if (existing) {
      target.convertedOrderId = existing.id
      target.status = 'แปลงเป็นคำสั่งซื้อแล้ว'
      bookings.value = [...bookings.value]
      return existing.id
    }

    const orderId = createOrderId()
    const createdOrder: AdminOrder = {
      id: orderId,
      referenceNo: target.referenceNo,
      customerName: target.customerName,
      phone: target.phone,
      itemName: target.packageName,
      amount: toAmount(target.budget),
      dueDate: target.eventDate,
      sourceBookingId: target.id,
      status: 'ใหม่'
    }

    target.convertedOrderId = orderId
    target.status = 'แปลงเป็นคำสั่งซื้อแล้ว'
    orders.value = [createdOrder, ...orders.value]
    bookings.value = [...bookings.value]

    orderHistory.value[orderId] = [
      {
        at: nowLabel(),
        by,
        from: '-',
        to: createdOrder.status,
        note: `ยืนยันจากรายการจอง ${target.referenceNo}`
      }
    ]

    if (!bookingHistory.value[id]) bookingHistory.value[id] = []
    bookingHistory.value[id].unshift({
      at: nowLabel(),
      by,
      from: 'รอยืนยัน',
      to: 'แปลงเป็นคำสั่งซื้อแล้ว',
      note: `ระบบสร้างคำสั่งซื้อ ${orderId}`
    })

    orderHistory.value = { ...orderHistory.value }
    bookingHistory.value = { ...bookingHistory.value }
    return orderId
  }

  const updateCategory = (id: string, patch: Partial<AdminCategory>): boolean => {
    const idx = categories.value.findIndex((item) => item.id === id)
    if (idx === -1) return false

    const current = categories.value[idx]
    if (!current) return false

    categories.value[idx] = {
      ...current,
      ...patch
    }

    categories.value = [...categories.value]
    return true
  }

  const createCategory = (payload: { name: string; description: string }): AdminCategory => {
    const created: AdminCategory = {
      id: createCategoryId(),
      name: payload.name.trim(),
      description: payload.description.trim()
    }

    categories.value = [created, ...categories.value]
    return created
  }

  const deleteCategory = (id: string): boolean => {
    const before = categories.value.length
    categories.value = categories.value.filter((item) => item.id !== id)
    return categories.value.length !== before
  }

  const updateCatalogItem = (id: string, patch: Partial<AdminCatalogItem>): boolean => {
    const idx = catalog.value.findIndex((item) => item.id === id)
    if (idx === -1) return false

    const current = catalog.value[idx]
    if (!current) return false

    catalog.value[idx] = {
      ...current,
      ...patch
    }

    catalog.value = [...catalog.value]
    return true
  }

  const createCatalogItem = (payload: {
    name: string
    category: string
    price: number
    leadTime: string
    isActive?: boolean
  }): AdminCatalogItem => {
    const created: AdminCatalogItem = {
      id: createCatalogId(),
      name: payload.name.trim(),
      category: payload.category.trim(),
      price: Number.isFinite(payload.price) ? Math.max(0, payload.price) : 0,
      leadTime: payload.leadTime.trim() || '-',
      isActive: payload.isActive ?? true
    }

    catalog.value = [created, ...catalog.value]
    return created
  }

  const deleteCatalogItem = (id: string): boolean => {
    const before = catalog.value.length
    catalog.value = catalog.value.filter((item) => item.id !== id)
    return catalog.value.length !== before
  }

  return {
    orders,
    bookings,
    catalog,
    categories,
    orderHistory,
    bookingHistory,
    updateOrderStatus,
    updateBookingStatus,
    updateCatalogItem,
    createCatalogItem,
    deleteCatalogItem,
    createBookingRequest,
    confirmBookingToOrder,
    updateCategory,
    createCategory,
    deleteCategory
  }
}
