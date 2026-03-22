export type AdminOrder = {
  id: string
  referenceNo: string
  customerName: string
  phone: string
  itemName: string
  amount: number
  dueDate: string
  sourceBookingId?: string
  status: 'ใหม่' | 'กำลังจัดทำ' | 'พร้อมรับสินค้า' | 'ส่งมอบแล้ว'
}

export type AdminBooking = {
  id: string
  referenceNo: string
  customerName: string
  phone: string
  packageName: string
  eventDate: string
  budget: string
  convertedOrderId?: string
  status: 'รอยืนยัน' | 'กำลังเตรียมงาน' | 'พร้อมส่งมอบ' | 'ส่งมอบแล้ว' | 'แปลงเป็นคำสั่งซื้อแล้ว'
}

export type AdminCatalogItem = {
  id: string
  name: string
  category: string
  price: number
  leadTime: string
  isActive: boolean
  images?: string[]
}

export type AdminCategory = {
  id: string
  name: string
  description: string
}

export const adminOrders: AdminOrder[] = [
  {
    id: 'ord-1001',
    referenceNo: 'NS-250322-1132',
    customerName: 'คุณศิริพร',
    phone: '0812345678',
    itemName: 'พานบายศรีมรดกไทย',
    amount: 3900,
    dueDate: '25 มี.ค. 2569',
    status: 'กำลังจัดทำ'
  },
  {
    id: 'ord-1002',
    referenceNo: 'NS-250322-2241',
    customerName: 'คุณธนกร',
    phone: '0894567812',
    itemName: 'บายศรีกรวยพรพรีเมียม',
    amount: 2800,
    dueDate: '24 มี.ค. 2569',
    status: 'ใหม่'
  },
  {
    id: 'ord-1003',
    referenceNo: 'NS-250322-5567',
    customerName: 'คุณวราภรณ์',
    phone: '0849987123',
    itemName: 'ชุดต้อนรับพิธีครบเซ็ต',
    amount: 5500,
    dueDate: '26 มี.ค. 2569',
    status: 'พร้อมรับสินค้า'
  }
]

export const adminBookings: AdminBooking[] = [
  {
    id: 'book-2001',
    referenceNo: 'NS-250322-1048',
    customerName: 'คุณพิมพ์ชนก',
    phone: '0891112233',
    packageName: 'บายศรีพญานาค',
    eventDate: '26 มี.ค. 2569',
    budget: '8,000 - 10,000',
    status: 'กำลังเตรียมงาน'
  },
  {
    id: 'book-2002',
    referenceNo: 'NS-250322-7812',
    customerName: 'คุณมนัสนันท์',
    phone: '0823457789',
    packageName: 'บายศรีมงคลมาตรฐาน',
    eventDate: '27 มี.ค. 2569',
    budget: '5,000 - 7,000',
    status: 'รอยืนยัน'
  },
  {
    id: 'book-2003',
    referenceNo: 'NS-250322-9914',
    customerName: 'บริษัทอรุณรุ่ง',
    phone: '0956623411',
    packageName: 'บายศรีต้อนรับแขกผู้ใหญ่',
    eventDate: '29 มี.ค. 2569',
    budget: '10,000+',
    status: 'พร้อมส่งมอบ'
  }
]

export const adminCatalog: AdminCatalogItem[] = [
  {
    id: 'tray-heritage',
    name: 'พานบายศรีมรดกไทย',
    category: 'พานพิธี',
    price: 3900,
    leadTime: '2-4 วัน',
    isActive: true,
    images: ['https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'cone-blessing',
    name: 'บายศรีกรวยพรพรีเมียม',
    category: 'บายศรีกรวย',
    price: 2800,
    leadTime: '2-3 วัน',
    isActive: true,
    images: ['https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'set-welcome',
    name: 'ชุดต้อนรับพิธีครบเซ็ต',
    category: 'ชุดจัดพิธี',
    price: 5500,
    leadTime: '3-5 วัน',
    isActive: false,
    images: ['https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=1200&q=80']
  }
]

export const adminCategories: AdminCategory[] = [
  {
    id: 'cat-tray',
    name: 'พานพิธี',
    description: 'งานพานบายศรีและพานประกอบพิธี'
  },
  {
    id: 'cat-cone',
    name: 'บายศรีกรวย',
    description: 'ชุดบายศรีกรวยสำหรับงานมงคลและงานบุญ'
  },
  {
    id: 'cat-set',
    name: 'ชุดจัดพิธี',
    description: 'แพ็กเกจครบเซ็ตสำหรับงานต้อนรับและงานองค์กร'
  }
]
