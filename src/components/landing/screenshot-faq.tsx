'use client'

import { motion } from 'framer-motion'
import { Smartphone, Bell, Wallet, FileText, Download, ShieldCheck } from 'lucide-react'
import { SectionHeading } from './sections'

const screenshotFeatures = [
  {
    icon: Wallet,
    title: 'Dashboard Keuangan',
    desc: 'Ringkasan tagihan dan pembayaran dalam satu layar',
  },
  {
    icon: FileText,
    title: 'Detail Tagihan',
    desc: 'Rincian lengkap setiap tagihan dengan status jelas',
  },
  {
    icon: Bell,
    title: 'Notifikasi',
    desc: 'Pemberitahuan langsung untuk setiap aktivitas',
  },
  {
    icon: Download,
    title: 'Bukti Digital',
    desc: 'Unduh kuitansi pembayaran kapan saja',
  },
]

export function Screenshot() {
  return (
    <section id="screenshot" className="py-20 sm:py-28 relative bg-muted/30">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          badge="Tampilan Aplikasi"
          title="Antarmuka yang Bersih & Intuitif"
          description="Setiap layar dirancang dengan teliti agar mudah dipahami oleh semua wali murid, dari yang muda hingga yang senior."
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Phone mockups */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-72 h-72 gradient-emerald rounded-full blur-3xl opacity-20" />

            {/* Main phone */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -5 }}
              whileInView={{ opacity: 1, y: 0, rotate: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="w-64 h-[520px] rounded-[2.5rem] bg-slate-900 dark:bg-slate-950 p-2 shadow-2xl border-4 border-slate-800 dark:border-slate-800">
                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-background relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 dark:bg-slate-950 rounded-b-2xl z-20" />
                  {/* Screen content */}
                  <div className="h-full flex flex-col">
                    <div className="pt-8 px-4 pb-3 gradient-emerald">
                      <div className="text-white/80 text-xs">Selamat Datang</div>
                      <div className="text-white font-bold text-lg">Bapak Abdullah</div>
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-hidden">
                      <div className="bg-card rounded-2xl p-3 border border-border shadow-sm">
                        <div className="text-xs text-muted-foreground">Total Tagihan</div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          Rp 450.000
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-2/3 gradient-emerald rounded-full" />
                        </div>
                      </div>
                      {[
                        { t: 'SPP Oktober', a: 'Rp 150.000', s: 'Lunas', c: 'text-emerald-600' },
                        { t: 'Kegiatan', a: 'Rp 200.000', s: 'Belum', c: 'text-amber-600' },
                        { t: 'Buku Paket', a: 'Rp 100.000', s: 'Belum', c: 'text-amber-600' },
                      ].map((it, i) => (
                        <div
                          key={i}
                          className="bg-card rounded-xl p-3 border border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-semibold">{it.t}</div>
                            <div className="text-xs text-muted-foreground">{it.a}</div>
                          </div>
                          <div className={`text-xs font-bold ${it.c}`}>{it.s}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Secondary phone behind */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute right-0 top-8 z-0 hidden sm:block"
            >
              <div className="w-52 h-[420px] rounded-[2rem] bg-slate-900 dark:bg-slate-950 p-1.5 shadow-2xl border-4 border-slate-800 opacity-90 rotate-6">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-background">
                  <div className="h-full gradient-emerald-soft p-4 flex flex-col justify-center items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <div className="font-bold">Pembayaran Berhasil</div>
                    <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                      Rp 150.000
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SPP Oktober 2024
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {screenshotFeatures.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border hover:border-emerald-500/30 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 rounded-xl gradient-emerald-soft flex items-center justify-center flex-shrink-0">
                  <feat.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">{feat.title}</h4>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="FAQ"
          title="Pertanyaan yang Sering Diajukan"
          description="Temukan jawaban atas pertanyaan umum seputar penggunaan aplikasi keuangan sekolah."
        />

        <div className="mt-14 max-w-3xl mx-auto">
          <div className="space-y-3">
            {faqListLocal.map((item, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-emerald-500/30 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none select-none">
                  <span className="font-semibold text-foreground">{item.pertanyaan}</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-open:rotate-45 transition-transform duration-300">
                    <span className="text-emerald-600 dark:text-emerald-400 text-lg leading-none">
                      +
                    </span>
                  </div>
                </summary>
                <div className="px-5 pb-5 pt-0 text-muted-foreground leading-relaxed text-sm">
                  {item.jawaban}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const faqListLocal = [
  {
    pertanyaan: 'Bagaimana cara mendaftar akun wali murid?',
    jawaban:
      'Akun wali murid dibuatkan oleh pihak sekolah secara otomatis saat anak terdaftar. Anda akan menerima email berisi tautan untuk mengatur kata sandi akun. Jika belum menerima, silakan hubungi bagian administrasi sekolah.',
  },
  {
    pertanyaan: 'Metode pembayaran apa saja yang didukung?',
    jawaban:
      'Aplikasi mendukung pembayaran tunai (di sekolah), transfer bank, QRIS, dan dompet digital. Setiap pembayaran akan tercatat secara otomatis dan bukti dapat diunduh kapan saja.',
  },
  {
    pertanyaan: 'Apakah aplikasi ini berbayar untuk wali murid?',
    jawaban:
      'Tidak. Aplikasi ini sepenuhnya gratis untuk seluruh wali murid MI Miftahul Ulum 01. Tidak ada biaya langganan atau biaya transaksi tambahan.',
  },
  {
    pertanyaan: 'Apakah data saya aman di aplikasi ini?',
    jawaban:
      'Aman. Seluruh data keuangan disimpan dengan enkripsi dan hanya dapat diakses oleh wali murid yang bersangkutan. Sistem kami mematuhi standar keamanan data sekolah.',
  },
  {
    pertanyaan: 'Bagaimana jika saya lupa kata sandi?',
    jawaban:
      'Anda dapat menggunakan fitur "Lupa Kata Sandi" pada halaman masuk. Tautan pemulihan akan dikirim ke email terdaftar. Bila mengalami kendala, hubungi administrasi sekolah.',
  },
  {
    pertanyaan: 'Apakah aplikasi bisa diakses tanpa internet?',
    jawaban:
      'Aplikasi dapat dipasang di HP Anda sebagai Progressive Web App. Beberapa informasi seperti riwayat pembayaran tetap dapat dilihat secara luring, namun pembayaran dan sinkronisasi memerlukan koneksi internet.',
  },
]
