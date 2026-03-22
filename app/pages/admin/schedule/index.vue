<template>
  <section class="space-y-4">
    <header class="panel rounded-2xl p-5 md:p-6">
      <p class="text-sm font-semibold tracking-wide text-[#48645d]">Schedule Calendar</p>
      <h1 class="mt-1 text-2xl font-bold text-[#21423b]">รายการตารางเวลา (ปฏิทิน)</h1>
      <p class="mt-1 text-sm text-[#4f6660]">ภาพรวมคิวงานจากรายการสั่งจองและคำสั่งซื้อในเดือนนี้</p>
    </header>

    <section class="panel overflow-hidden rounded-2xl p-4 md:p-5">
      <div class="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span class="legend-chip booking">จอง</span>
        <span class="legend-chip order">สั่งซื้อ</span>
        <span class="legend-chip delivered">ส่งมอบ</span>
      </div>

      <div class="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#5a7770]">
        <span v-for="day in weekDays" :key="day">{{ day }}</span>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <article
          v-for="day in calendarDays"
          :key="day.day"
          class="calendar-cell rounded-xl border p-2"
          :class="day.events.length ? 'has-events' : ''"
        >
          <p class="text-xs font-semibold text-[#36524b]">{{ day.day }}</p>
          <div class="mt-2 space-y-1">
            <NuxtLink
              v-for="event in day.events"
              :key="event.id"
              class="event-chip rounded-md px-2 py-1 text-[11px]"
              :class="event.type"
              :to="event.to"
            >
              {{ event.title }}
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminMvpStore } from '~/composables/useAdminMvpStore'

definePageMeta({
  layout: 'admin'
})

const { bookings, orders } = useAdminMvpStore()
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarEventType = 'booking' | 'order' | 'delivered'

type CalendarEvent = {
  id: string
  title: string
  type: CalendarEventType
  to: string
}

const toDayNumber = (value: string): number => {
  const m = value.match(/\d+/)
  if (!m || !m[0]) return 0
  return Number(m[0])
}

const calendarDays = computed(() => {
  const days = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, events: [] as CalendarEvent[] }))

  bookings.value.forEach((item) => {
    const day = toDayNumber(item.eventDate)
    if (day >= 1 && day <= 31) {
      days[day - 1]?.events.push({
        id: `${item.id}-booking`,
        title: `จอง: ${item.customerName}`,
        type: 'booking',
        to: `/admin/booking/${item.id}`
      })

      if (item.status === 'ส่งมอบแล้ว') {
        days[day - 1]?.events.push({
          id: `${item.id}-delivered`,
          title: `ส่งมอบ: ${item.customerName}`,
          type: 'delivered',
          to: item.convertedOrderId ? `/admin/order/${item.convertedOrderId}` : `/admin/booking/${item.id}`
        })
      }
    }
  })

  orders.value.forEach((item) => {
    const day = toDayNumber(item.dueDate)
    if (day >= 1 && day <= 31) {
      days[day - 1]?.events.push({
        id: `${item.id}-order`,
        title: `สั่งซื้อ: ${item.customerName}`,
        type: 'order',
        to: `/admin/order/${item.id}`
      })

      if (item.status === 'ส่งมอบแล้ว') {
        days[day - 1]?.events.push({
          id: `${item.id}-delivered`,
          title: `ส่งมอบ: ${item.customerName}`,
          type: 'delivered',
          to: `/admin/order/${item.id}`
        })
      }
    }
  })

  return days
})
</script>

<style scoped>
.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(6, 95, 70, 0.14);
}

.calendar-cell {
  min-height: 86px;
  border-color: rgba(6, 95, 70, 0.14);
  background: rgba(255, 255, 255, 0.84);
}

.calendar-cell.has-events {
  border-color: rgba(5, 150, 105, 0.32);
  background: rgba(236, 253, 245, 0.65);
}

.event-chip {
  display: block;
  line-height: 1.25;
  color: #21423b;
  border: 1px solid transparent;
  text-decoration: none;
  transition: transform 120ms ease, filter 120ms ease;
}

.event-chip:hover {
  transform: translateY(-1px);
  filter: brightness(0.98);
}

.legend-chip {
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0.25rem 0.6rem;
}

.event-chip.booking {
  border-color: rgba(5, 150, 105, 0.24);
  background: rgba(5, 150, 105, 0.12);
}

.legend-chip.booking {
  border-color: rgba(5, 150, 105, 0.24);
  background: rgba(5, 150, 105, 0.12);
  color: #14532d;
}

.event-chip.order {
  border-color: rgba(15, 118, 110, 0.24);
  background: rgba(13, 148, 136, 0.12);
}

.legend-chip.order {
  border-color: rgba(15, 118, 110, 0.24);
  background: rgba(13, 148, 136, 0.12);
  color: #134e4a;
}

.event-chip.delivered {
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(255, 237, 213, 0.75);
}

.legend-chip.delivered {
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(255, 237, 213, 0.8);
  color: #9a3412;
}
</style>
