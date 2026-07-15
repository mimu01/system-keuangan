import { redirect } from 'next/navigation'
import { getWaliSession } from '@/lib/wali-auth'
import { LoginForm } from './login-form'

export default async function AppLoginPage() {
  const session = await getWaliSession()
  if (session) {
    redirect('/app/dashboard')
  }
  return <LoginForm />
}
