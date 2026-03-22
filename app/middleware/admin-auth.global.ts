export default defineNuxtRouteMiddleware((to) => {
  const adminSession = useCookie<string | null>('admin_session')

  const isAdminRoute = to.path.startsWith('/admin')
  const isAdminLoginRoute = to.path === '/manage/login'

  if (isAdminRoute && !adminSession.value) {
    return navigateTo('/manage/login')
  }

  if (isAdminLoginRoute && adminSession.value) {
    return navigateTo('/admin/dashboard')
  }
})
