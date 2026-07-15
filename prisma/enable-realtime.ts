// Enable Supabase Realtime untuk semua tabel aplikasi
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('📡 Mengaktifkan Supabase Realtime untuk semua tabel...')

  // Tambahkan semua tabel ke publication supabase_realtime
  // Supabase hanya broadcast perubahan tabel yang ada di publication ini
  const sql = `
    ALTER PUBLICATION supabase_realtime ADD TABLE
      admins,
      tahun_ajaran,
      kelas,
      siswa,
      wali_murid,
      jenis_pembayaran,
      tagihan,
      pembayaran,
      pengeluaran,
      notifikasi,
      activity_log,
      pengaturan;
  `

  try {
    await db.$executeRawUnsafe(sql)
    console.log('✅ Realtime publication berhasil diaktifkan untuk semua tabel')
  } catch (error: any) {
    // Jika tabel sudah ada di publication, akan error — itu normal
    if (error.message?.includes('already member of publication')) {
      console.log('ℹ️  Beberapa tabel sudah ada di publication (OK)')
    } else {
      console.error('❌ Error:', error.message)
    }
  }

  // Verifikasi
  const result: any = await db.$queryRaw`
    SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;
  `
  console.log('\n📋 Tabel yang sudah aktif Realtime:')
  result.forEach((r: any) => console.log(`   - ${r.tablename}`))
}

main()
  .catch((e) => {
    console.error('❌ Gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
