'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Send, Download, GraduationCap, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SectionHeading } from './sections'
import { kontakInfo, langkahUnduh } from './data'

export function Contact() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // Simulasi pengiriman pesan
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    toast.success('Pesan Anda berhasil dikirim. Sekolah akan menghubungi Anda segera.')
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <section id="kontak" className="py-20 sm:py-28 relative bg-muted/30">
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          badge="Hubungi Kami"
          title="Ada Pertanyaan? Sampaikan Kepada Kami"
          description="Tim administrasi MI Miftahul Ulum 01 siap membantu Anda. Kirim pesan atau hubungi langsung melalui kontak di bawah."
        />

        <div className="mt-14 grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {kontakInfo.map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-emerald-500/30 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 rounded-xl gradient-emerald-soft flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{info.label}</div>
                  <div className="font-semibold text-foreground mt-0.5">{info.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input id="nama" name="nama" placeholder="Masukkan nama Anda" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjek">Subjek</Label>
                <Input id="subjek" name="subjek" placeholder="Topik pesan Anda" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pesan">Pesan</Label>
                <Textarea
                  id="pesan"
                  name="pesan"
                  placeholder="Tuliskan pertanyaan atau pesan Anda..."
                  rows={5}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto gradient-emerald text-white border-0 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 rounded-xl h-12 px-8"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Pesan
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function DownloadCTA() {
  return (
    <section id="unduh" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 gradient-emerald" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl" />

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Mulai Hari Ini
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance"
            >
              Unduh Aplikasi Wali Murid Sekarang
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-5 text-lg text-white/80 max-w-2xl mx-auto text-balance"
            >
              Gratis, mudah, dan aman. Pasang aplikasi di HP Anda dan kelola
              keuangan sekolah anak dengan tenang.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button className="w-full sm:w-auto flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-emerald-700 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] font-medium opacity-70">Unduh untuk</div>
                  <div className="text-sm leading-tight">Android (PWA)</div>
                </div>
              </button>
              <button className="w-full sm:w-auto flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/15 backdrop-blur text-white font-bold border border-white/20 hover:bg-white/20 hover:scale-[1.02] transition-all">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] font-medium opacity-70">Buka di</div>
                  <div className="text-sm leading-tight">Browser HP</div>
                </div>
              </button>
            </motion.div>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-16 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            >
              {langkahUnduh.map((step, i) => (
                <div key={i} className="text-left">
                  <div className="text-3xl font-extrabold text-white/30 mb-2">
                    {step.nomor}
                  </div>
                  <h4 className="font-bold text-white mb-1">{step.judul}</h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {step.deskripsi}
                  </p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tanpa Biaya</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Data Aman</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Resmi Sekolah</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center shadow-md shadow-emerald-600/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-base">MI Miftahul Ulum 01</div>
                <div className="text-xs text-muted-foreground">
                  Sistem Informasi Keuangan Sekolah
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Aplikasi resmi MI Miftahul Ulum 01 untuk memudahkan wali murid
              mengelola dan memantau keuangan sekolah anak secara digital,
              transparan, dan aman.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Resmi & Terverifikasi
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { l: 'Beranda', h: '#beranda' },
                { l: 'Tentang', h: '#tentang' },
                { l: 'Fitur', h: '#fitur' },
                { l: 'FAQ', h: '#faq' },
                { l: 'Kontak', h: '#kontak' },
              ].map((link) => (
                <li key={link.h}>
                  <a
                    href={link.h}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {link.l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Kontak Sekolah</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Jl. Miftahul Ulum No. 01</li>
              <li>Pasuruan, Jawa Timur</li>
              <li>
                <a
                  href="tel:0343123456"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  (0343) 123-456
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@miftahululum01.sch.id"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  info@miftahululum01.sch.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} MI Miftahul Ulum 01. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Dibuat dengan untuk Wali Murid</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
