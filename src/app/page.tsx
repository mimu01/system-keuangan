import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { About, Features, Advantages } from '@/components/landing/sections'
import { Screenshot, Faq } from '@/components/landing/screenshot-faq'
import { Contact, DownloadCTA, Footer } from '@/components/landing/contact-footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <Advantages />
        <Screenshot />
        <Faq />
        <Contact />
        <DownloadCTA />
      </main>
      <Footer />
    </div>
  )
}
