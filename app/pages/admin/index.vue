<script setup lang="ts">
const { ensureAdminAuth } = useAdminApi()
const isAuthenticated = await ensureAdminAuth()

if (isAuthenticated) {
  await navigateTo('/admin/dashboard', { redirectCode: 302 })
} else {
  await navigateTo('/manage/login', { redirectCode: 302 })
}
</script>

<template>
  <div />
</template>