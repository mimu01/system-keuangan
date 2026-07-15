'use client'

import { motion } from 'framer-motion'
import { Download, ArrowRight, Sparkles, ShieldCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { statistikSekolah } from './data'

export function Hero() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="beranda"
      className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] gradient-emerald-soft rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-emerald-500/20 text-sm font-medium mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-muted-foreground">Resmi MI Miftahul Ulum 01</span>
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400">Tahun Ajaran 2024/2025</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-balance leading-[1.05]"
          >
            Kelola Keuangan Sekolah
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Mudah & Transparan
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed"
          >
            Aplikasi resmi MI Miftahul Ulum 01 untuk wali murid. Pantau tagihan,
            bayar SPP, dan unduh bukti pembayaran — semua dalam genggaman Anda.
          </motion.p>

          {/* CTAs — ONLY "Unduh Aplikasi Wali Murid" */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              onClick={() => scrollTo('#unduh')}
              size="lg"
              className="w-full sm:w-auto gradient-emerald text-white border-0 text-base h-14 px-8 shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/40 hover:scale-[1.02] transition-all rounded-2xl group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
              Unduh Aplikasi Wali Murid
            </Button>
            <Button
              onClick={() => scrollTo('#fitur')}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base h-14 px-8 rounded-2xl border-border hover:bg-accent bg-background/60 backdrop-blur"
            >
              Lihat Fitur
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Gratis untuk Wali Murid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
              <span>Dipercaya 280+ Keluarga</span>
            </div>
          </motion.div>
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
          className="mt-16 sm:mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 gradient-emerald rounded-3xl blur-2xl opacity-20 scale-95" />
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl shadow-emerald-950/10 bg-card">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground font-medium">
                  MI Miftahul Ulum 01 — Dashboard Keuangan
                </span>
              </div>
            </div>
            {/* Content */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <img
                src="/hero-school.png"
                alt="Ilustrasi MI Miftahul Ulum 01"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden sm:block absolute -left-6 top-1/3 glass-strong rounded-2xl shadow-xl p-4 border border-border w-52"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pembayaran</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Berhasil
                </div>
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold">Rp 150.000</div>
            <div className="text-xs text-muted-foreground">SPP Oktober 2024</div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="hidden sm:block absolute -right-6 bottom-1/4 glass-strong rounded-2xl shadow-xl p-4 border border-border w-52"
          >
            <div className="text-xs text-muted-foreground mb-2">Status Tagihan</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  Lunas
                </div>
                <div className="text-xs text-muted-foreground mt-1">3 dari 5 tagihan</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin-slow" />
            </div>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 sm:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {statistikSekolah.map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-950/5 transition-all"
            >
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-br from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
