import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/db'
import { generateKodeTransaksi } from '../src/lib/types'

async function main() {
  console.log('🌱 Memulai seeding database...')

  // 1. Admin
  const adminPassword = await hashPassword('admin123')
  const admin = await db.admin.upsert({
    where: { email: 'admin@miftahululum01.sch.id' },
    update: {},
    create: {
      nama: 'Administrator',
      email: 'admin@miftahululum01.sch.id',
      passwordHash: adminPassword,
      role: 'ADMIN',
      noHp: '081234567890',
      aktif: true,
    },
  })
  console.log('✅ Admin dibuat:', admin.email)

  // 2. Tahun Ajaran
  const tahunAjaran = await db.tahunAjaran.upsert({
    where: { nama: '2024/2025' },
    update: {},
    create: {
      nama: '2024/2025',
      tanggalMulai: new Date('2024-07-15'),
      tanggalSelesai: new Date('2025-06-30'),
      aktif: true,
    },
  })
  console.log('✅ Tahun Ajaran:', tahunAjaran.nama)

  // 3. Kelas
  const kelasData = [
    { nama: '1A', tingkat: 1, waliKelas: 'Ustadzah Aisyah, S.Pd' },
    { nama: '2A', tingkat: 2, waliKelas: 'Ustadzah Fatimah, S.Pd.I' },
    { nama: '3A', tingkat: 3, waliKelas: 'Ustadz Ahmad, S.Pd' },
    { nama: '4A', tingkat: 4, waliKelas: 'Ustadzah Khadijah, S.Pd' },
    { nama: '5A', tingkat: 5, waliKelas: 'Ustadz Yusuf, M.Pd' },
    { nama: '6A', tingkat: 6, waliKelas: 'Ustadz Ridwan, M.Pd' },
  ]

  const kelasList = []
  for (const k of kelasData) {
    const kelas = await db.kelas.create({
      data: {
        ...k,
        tahunAjaranId: tahunAjaran.id,
        kapasitas: 30,
      },
    })
    kelasList.push(kelas)
  }
  console.log('✅ Kelas dibuat:', kelasList.length)

  // 4. Siswa & Wali Murid
  const namaSiswa = [
    { nama: 'Muhammad Faiz Abdullah', jk: 'L', kelas: 0, wali: 'Bapak Abdullah', noHp: '081234500001' },
    { nama: 'Aisyah Nur Hidayah', jk: 'P', kelas: 0, wali: 'Ibu Siti Aminah', noHp: '081234500002' },
    { nama: 'Abdul Rahman Hakim', jk: 'L', kelas: 1, wali: 'Bapak Hakim', noHp: '081234500003' },
    { nama: 'Zahra Salsabila', jk: 'P', kelas: 1, wali: 'Ibu Fatimah', noHp: '081234500004' },
    { nama: 'Umar Faruq', jk: 'L', kelas: 2, wali: 'Bapak Faruq', noHp: '081234500005' },
    { nama: 'Maryam Az-Zahra', jk: 'P', kelas: 2, wali: 'Ibu Khadijah', noHp: '081234500006' },
    { nama: 'Ali Akbar', jk: 'L', kelas: 3, wali: 'Bapak Akbar', noHp: '081234500007' },
    { nama: 'Hafshah Ummu', jk: 'P', kelas: 3, wali: 'Ibu Ummu', noHp: '081234500008' },
    { nama: 'Hasan Basri', jk: 'L', kelas: 4, wali: 'Bapak Basri', noHp: '081234500009' },
    { nama: 'Aminah Zulaikha', jk: 'P', kelas: 4, wali: 'Ibu Zulaikha', noHp: '081234500010' },
    { nama: 'Husain Putra', jk: 'L', kelas: 5, wali: 'Bapak Putra', noHp: '081234500011' },
    { nama: 'Sumayyah Putri', jk: 'P', kelas: 5, wali: 'Ibu Putri', noHp: '081234500012' },
  ]

  let nisCounter = 2024001
  for (const s of namaSiswa) {
    const siswa = await db.siswa.create({
      data: {
        nis: String(nisCounter++),
        nisn: String(3000000 + nisCounter),
        nama: s.nama,
        jenisKelamin: s.jk,
        tempatLahir: 'Pasuruan',
        tanggalLahir: new Date(2016 + Math.floor(s.kelas / 2), 0, 15),
        alamat: 'Jl. Miftahul Ulum No. ' + nisCounter,
        kelasId: kelasList[s.kelas].id,
        tahunAjaranId: tahunAjaran.id,
        status: 'AKTIF',
        tanggalMasuk: new Date('2024-07-15'),
      },
    })

    const waliPassword = await hashPassword('wali123')
    await db.waliMurid.create({
      data: {
        nama: s.wali,
        email: `wali${nisCounter}@miftahululum01.sch.id`,
        noHp: s.noHp,
        alamat: siswa.alamat,
        pekerjaan: 'Wiraswasta',
        hubungan: 'Orang Tua',
        siswaId: siswa.id,
        passwordHash: waliPassword,
      },
    })
  }
  console.log('✅ Siswa & Wali Murid dibuat:', namaSiswa.length)

  // 5. Jenis Pembayaran
  const jenisPembayaran = [
    { nama: 'SPP Bulanan', kategori: 'SPP', frekuensi: 'BULANAN', jumlah: 150000 },
    { nama: 'Uang Pangkal', kategori: 'PENGEMBANGAN', frekuensi: 'SEKALI', jumlah: 500000 },
    { nama: 'Kegiatan Semester', kategori: 'KEGIATAN', frekuensi: 'SEMESTER', jumlah: 200000 },
    { nama: 'Seragam', kategori: 'SERAGAM', frekuensi: 'SEKALI', jumlah: 350000 },
    { nama: 'Buku Paket', kategori: 'BUKU', frekuensi: 'TAHUNAN', jumlah: 300000 },
  ]

  for (const jp of jenisPembayaran) {
    await db.jenisPembayaran.create({
      data: {
        ...jp,
        deskripsi: `Pembayaran ${jp.nama} Tahun Ajaran ${tahunAjaran.nama}`,
        tahunAjaranId: tahunAjaran.id,
        aktif: true,
      },
    })
  }
  console.log('✅ Jenis Pembayaran dibuat:', jenisPembayaran.length)

  // 6. Tagihan & Pembayaran (untuk siswa pertama)
  const semuaSiswa = await db.siswa.findMany({ take: 4 })
  const sppJenis = await db.jenisPembayaran.findFirst({ where: { kategori: 'SPP' } })

  if (sppJenis) {
    for (const siswa of semuaSiswa) {
      const tagihan = await db.tagihan.create({
        data: {
          siswaId: siswa.id,
          jenisPembayaranId: sppJenis.id,
          tahunAjaranId: tahunAjaran.id,
          periode: '2024-10',
          jumlah: 150000,
          jumlahDibayar: 0,
          tanggalJatuhTempo: new Date('2024-10-10'),
          status: 'BELUM_BAYAR',
        },
      })

      // 2 siswa sudah bayar
      if (siswa.nis === '2024001' || siswa.nis === '2024002') {
        const wali = await db.waliMurid.findFirst({ where: { siswaId: siswa.id } })
        const pembayaran = await db.pembayaran.create({
          data: {
            tagihanId: tagihan.id,
            waliMuridId: wali?.id,
            diterimaOleh: admin.id,
            jumlah: 150000,
            metode: 'TUNAI',
            tanggalBayar: new Date(),
            status: 'BERHASIL',
            kodeTransaksi: generateKodeTransaksi(),
            keterangan: 'Pembayaran SPP Oktober',
          },
        })
        await db.tagihan.update({
          where: { id: tagihan.id },
          data: {
            jumlahDibayar: 150000,
            status: 'LUNAS',
          },
        })
      }
    }
  }
  console.log('✅ Tagihan & Pembayaran dibuat')

  // 7. Pengeluaran
  const pengeluaranData = [
    { judul: 'Gaji Guru September', kategori: 'GAJI', jumlah: 15000000 },
    { judul: 'Pembelian Alat Tulis', kategori: 'PEMBELIAN', jumlah: 2500000 },
    { judul: 'Pemeliharaan AC Kelas', kategori: 'PEMELIHARAAN', jumlah: 1500000 },
    { judul: 'Listrik & Air', kategori: 'OPERASIONAL', jumlah: 1800000 },
    { judul: 'Konsumsi Rapat', kategori: 'OPERASIONAL', jumlah: 500000 },
  ]

  for (let i = 0; i < pengeluaranData.length; i++) {
    const p = pengeluaranData[i]
    await db.pengeluaran.create({
      data: {
        ...p,
        deskripsi: `Pengeluaran ${p.judul}`,
        dibuatOleh: admin.id,
        tanggal: new Date(2024, 9, (i + 1) * 3),
      },
    })
  }
  console.log('✅ Pengeluaran dibuat:', pengeluaranData.length)

  // 8. Notifikasi
  await db.notifikasi.create({
    data: {
      judul: 'Selamat Datang',
      pesan: 'Sistem Informasi Keuangan MI Miftahul Ulum 01 telah aktif. Silakan kelola data keuangan sekolah.',
      tipe: 'PENGUMUMAN',
      penerima: 'ADMIN',
      dibuatOleh: admin.id,
    },
  })
  console.log('✅ Notifikasi dibuat')

  // 9. Pengaturan
  const pengaturanData = [
    { key: 'nama_sekolah', value: 'MI Miftahul Ulum 01', keterangan: 'Nama sekolah' },
    { key: 'alamat_sekolah', value: 'Jl. Miftahul Ulum No. 01, Pasuruan, Jawa Timur', keterangan: 'Alamat sekolah' },
    { key: 'telepon_sekolah', value: '0343-123456', keterangan: 'Telepon sekolah' },
    { key: 'email_sekolah', value: 'info@miftahululum01.sch.id', keterangan: 'Email sekolah' },
    { key: 'kepala_sekolah', value: 'H. Muhammad Saiful Anam, M.Pd.I', keterangan: 'Nama kepala sekolah' },
    { key: 'nis_sekolah', value: '121234500001', keterangan: 'NIS sekolah' },
  ]

  for (const p of pengaturanData) {
    await db.pengaturan.upsert({
      where: { key: p.key },
      update: { value: p.value },
      create: p,
    })
  }
  console.log('✅ Pengaturan dibuat:', pengaturanData.length)

  console.log('\n🎉 Seeding selesai!')
  console.log('\n📋 Login Admin:')
  console.log('   Email: admin@miftahululum01.sch.id')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
