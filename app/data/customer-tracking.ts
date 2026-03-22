export type TrackingStep = {
  title: string
  at: string
  done: boolean
}

export type TrackingRecord = {
  referenceNo: string
  phone: string
  customerName: string
  type: 'booking' | 'product'
  itemName: string
  statusLabel: string
  appointmentDate: string
  note: string
  timeline: TrackingStep[]
}

export const normalizePhone = (value: string): string => value.replace(/\D/g, '')

export const trackingRecords: TrackingRecord[] = [
  {
    referenceNo: 'NS-250322-1048',
    phone: '0891112233',
    customerName: 'คุณพิมพ์ชนก',
    type: 'booking',
    itemName: 'บายศรีพญานาค',
    statusLabel: 'กำลังจัดเตรียมวัสดุ',
    appointmentDate: '26 มี.ค. 2569',
    note: 'ทีมงานจะโทรยืนยันรายละเอียดหน้างานอีกครั้ง',
    timeline: [
      { title: 'รับคำขอเรียบร้อย', at: '22 มี.ค. 2569 10:48', done: true },
      { title: 'ติดต่อยืนยันรายละเอียด', at: '22 มี.ค. 2569 12:10', done: true },
      { title: 'กำลังจัดเตรียมวัสดุ', at: '23 มี.ค. 2569 09:30', done: true },
      { title: 'พร้อมส่งมอบ', at: '26 มี.ค. 2569 08:30', done: false }
    ]
  },
  {
    referenceNo: 'NS-250322-1132',
    phone: '0812345678',
    customerName: 'คุณศิริพร',
    type: 'product',
    itemName: 'พานบายศรีมรดกไทย',
    statusLabel: 'กำลังจัดทำสินค้า',
    appointmentDate: '25 มี.ค. 2569',
    note: 'รับสินค้าที่หน้าร้านช่วงบ่าย',
    timeline: [
      { title: 'รับคำสั่งซื้อเรียบร้อย', at: '22 มี.ค. 2569 11:32', done: true },
      { title: 'รอตรวจสอบข้อมูล', at: '22 มี.ค. 2569 11:50', done: true },
      { title: 'กำลังจัดทำสินค้า', at: '23 มี.ค. 2569 10:15', done: true },
      { title: 'พร้อมรับสินค้า', at: '25 มี.ค. 2569 13:00', done: false }
    ]
  }
]

export const findTrackingRecord = (referenceNo: string, phone: string): TrackingRecord | undefined => {
  const normalizedRef = referenceNo.trim().toUpperCase()
  const normalizedPhone = normalizePhone(phone)

  return trackingRecords.find(
    (item) => item.referenceNo.toUpperCase() === normalizedRef && normalizePhone(item.phone) === normalizedPhone
  )
}

export const generateReferenceNo = (): string => {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const random4 = String(Math.floor(1000 + Math.random() * 9000))
  return `NS-${yy}${mm}${dd}-${random4}`
}
