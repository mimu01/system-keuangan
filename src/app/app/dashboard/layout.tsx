import { redirect } from 'next/navigation'
import { getCurrentWali } from '@/lib/wali-auth'
import { QueryProvider } from '@/components/admin/query-provider'
import { AppShell } from './app-shell'

export default async function WaliDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const wali = await getCurrentWali()
  if (!wali) {
    redirect('/app')
  }

  return (
    <QueryProvider>
      <AppShell
        wali={{
          id: wali.id,
          nama: wali.nama,
          email: wali.email,
        }}
        siswa={{
          id: wali.siswa.id,
          nama: wali.siswa.nama,
          nis: wali.siswa.nis,
          kelas: wali.siswa.kelas?.nama ?? '-',
          foto: wali.siswa.foto,
        }}
      >
        {children}
      </AppShell>
    </QueryProvider>
  )
}
