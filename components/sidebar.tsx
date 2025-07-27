"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, Wallet, LogOut, Menu, X } from "lucide-react"
import stellarWalletService from "@/lib/stellar-wallet"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Configuración", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null)

  useEffect(() => {
    // Check wallet connection status
    const checkWalletConnection = () => {
      const isConnected = stellarWalletService.isConnected()
      const publicKey = stellarWalletService.getPublicKey()
      
      setWalletConnected(isConnected)
      setWalletPublicKey(publicKey)
    }

    checkWalletConnection()
    
    // Check for wallet connection changes
    const interval = setInterval(checkWalletConnection, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleDisconnectWallet = async () => {
    try {
      await stellarWalletService.disconnectWallet()
      setWalletConnected(false)
      setWalletPublicKey(null)
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("merchantEmail")
      router.push("/login")
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const isLoginPage = pathname === "/login"
  const isCheckoutPage = pathname?.startsWith("/checkout")

  if (isLoginPage || isCheckoutPage) {
    return null
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StellarPay
              </h1>
              <p className="text-xs text-slate-500">Crypto Payments</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {walletConnected && walletPublicKey ? (
                  <>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {stellarWalletService.formatPublicKey(walletPublicKey)}
                    </p>
                    <p className="text-xs text-slate-500">Wallet Connected</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-900 truncate">No Wallet</p>
                    <p className="text-xs text-slate-500">Disconnected</p>
                  </>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnectWallet}
              className="w-full justify-start text-slate-600 hover:text-slate-900"
              disabled={!walletConnected}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
