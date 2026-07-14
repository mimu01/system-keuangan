'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, GraduationCap } from 'lucide-react'
import { fiturList, keunggulanList } from './data'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
}

export function SectionHeading({
  badge,
  title,
  description,
  align = 'center',
}: {
  badge: string
  title: React.ReactNode
  description?: string
  align?: 'center' | 'left'
}) {
  return (
    <div
      className={
        align === 'center'
          ? 'text-center max-w-2xl mx-auto'
          : 'text-left max-w-2xl'
      }
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4"
      >
        {badge}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-lg text-muted-foreground text-balance"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}

export function About() {
  const points = [
    'Tagihan sekolah selalu terupdate secara otomatis',
    'Pembayaran tercatat rapi tanpa khawatir kehilangan kuitansi',
    'Riwayat keuangan anak dapat diakses kapan saja',
    'Komunikasi dengan sekolah menjadi lebih transparan',
  ]

  return (
    <section id="tentang" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute inset-0 gradient-emerald-soft rounded-3xl blur-2xl opacity-60" />
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
              <div className="aspect-[4/3] relative">
                <img
                  src="/screenshot-dashboard.png"
                  alt="Tampilan aplikasi keuangan sekolah"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl gradient-emerald flex items-center justify-center shadow-xl animate-float">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
          </motion.div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <SectionHeading
              badge="Tentang Aplikasi"
              align="left"
              title={
                <>
                  Solusi Keuangan Sekolah{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Modern
                  </span>{' '}
                  untuk Wali Murid
                </>
              }
              description="MI Miftahul Ulum 01 menghadirkan aplikasi keuangan digital yang memudahkan setiap wali murid memantau dan mengelola pembayaran sekolah anak, kapan saja dan di mana saja."
            />
            <div className="mt-8 space-y-3">
              {points.map((point, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{point}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Features() {
  return (
    <section id="fitur" className="py-20 sm:py-28 relative bg-muted/30">
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeading
          badge="Fitur Utama"
          title="Semua yang Wali Murid Butuhkan"
          description="Fitur lengkap yang dirancang khusus untuk memberikan kenyamanan dan transparansi dalam mengelola keuangan sekolah anak Anda."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fiturList.map((fitur, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl gradient-emerald-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <fitur.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{fitur.judul}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {fitur.deskripsi}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Advantages() {
  return (
    <section id="keunggulan" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="Keunggulan"
          title="Mengapa Memilih Aplikasi Kami"
          description="Bukan sekadar aplikasi pembayaran, tetapi sistem yang dibangun untuk kenyamanan dan kepercayaan wali murid."
        />

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {keunggulanList.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-card border border-border hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full gradient-emerald-soft opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.judul}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
