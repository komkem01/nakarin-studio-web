<script setup lang="ts">
const adminSession = useCookie<string | null>('admin_session')

if (adminSession.value) {
  await navigateTo('/admin/dashboard', { redirectCode: 302 })
} else {
  await navigateTo('/manage/login', { redirectCode: 302 })
}
</script>

<template>
  <div />
</template>