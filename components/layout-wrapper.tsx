"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Pages that need full-screen layout without container
  const isFullScreenPage = pathname === "/login" || pathname?.startsWith("/checkout")
  
  if (isFullScreenPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // Default layout with sidebar and container
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
