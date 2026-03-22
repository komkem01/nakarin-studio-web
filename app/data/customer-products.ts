export type CustomerProduct = {
  id: string
  name: string
  category: string
  description: string
  price: string
  leadTime: string
  size: string
  includes: string[]
  note: string
}

export const customerProducts: CustomerProduct[] = [
  {
    id: 'tray-heritage',
    name: 'พานบายศรีมรดกไทย',
    category: 'พานพิธี',
    description: 'พานบายศรีทรงสูงเน้นเส้นใบตองคมชัด เหมาะกับพิธีมงคลที่ต้องการภาพรวมสง่างาม',
    price: '฿3,900',
    leadTime: '2-4 วัน',
    size: 'สูงประมาณ 45 ซม.',
    includes: ['พานหลัก 1 ชุด', 'ตกแต่งดอกไม้สดตามโทนงาน', 'บรรจุภัณฑ์พร้อมส่ง'],
    note: 'สามารถเพิ่มป้ายชื่อพิธีได้'
  },
  {
    id: 'cone-blessing',
    name: 'บายศรีกรวยพรพรีเมียม',
    category: 'บายศรีกรวย',
    description: 'บายศรีกรวยโทนขาวทอง ดูเรียบหรู เหมาะกับงานขึ้นบ้านใหม่ งานบวช และงานองค์กร',
    price: '฿2,800',
    leadTime: '2-3 วัน',
    size: 'กรวยหลัก 2 ชิ้น',
    includes: ['กรวยบายศรีคู่', 'ฐานรองพร้อมจัดวาง', 'คำแนะนำการจัดโต๊ะพิธี'],
    note: 'ปรับธีมสีให้ตรงกับงานได้'
  },
  {
    id: 'set-welcome',
    name: 'ชุดต้อนรับพิธีครบเซ็ต',
    category: 'ชุดจัดพิธี',
    description: 'ชุดพร้อมใช้งานสำหรับพิธีต้อนรับผู้ใหญ่หรือพิธีเปิดงาน มีองค์ประกอบครบและจัดวางง่าย',
    price: '฿5,500',
    leadTime: '3-5 วัน',
    size: 'เซ็ตกลาง 3 องค์ประกอบ',
    includes: ['บายศรีหลัก', 'พานรองเครื่องสักการะ', 'ชุดดอกไม้ประกอบฉาก'],
    note: 'ทีมงานช่วยแนะนำตำแหน่งจัดวางหน้างาน'
  }
]

export const customerProductMap = Object.fromEntries(
  customerProducts.map((item) => [item.id, item])
) as Record<string, CustomerProduct>
