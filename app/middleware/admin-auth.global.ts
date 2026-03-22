export default defineNuxtRouteMiddleware(async (to) => {
  const { ensureAdminAuth } = useAdminApi()

  const isAdminRoute = to.path.startsWith('/admin')
  const isAdminLoginRoute = to.path === '/manage/login'
  const isAuthenticated = await ensureAdminAuth()

  if (isAdminRoute && !isAuthenticated) {
    return navigateTo('/manage/login')
  }

  if (isAdminLoginRoute && isAuthenticated) {
    return navigateTo('/admin/dashboard')
  }
})
