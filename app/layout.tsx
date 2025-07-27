import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StellarPay - Crypto Payments Platform",
  description: "Accept crypto payments on Stellar network with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
          <Sidebar />
          <main className="lg:pl-64">
            <div className="px-4 py-8 lg:px-8">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
