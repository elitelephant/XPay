"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Wallet, Shield, Zap, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
import stellarWalletService from "@/lib/stellar-wallet"

export default function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()

  const handleWalletConnect = async () => {
    setIsConnecting(true)
    try {
      const { publicKey, walletType } = await stellarWalletService.connectWallet()
      
      // Show success message
      toast.success(`Connected to ${walletType}`, {
        description: `Public Key: ${stellarWalletService.formatPublicKey(publicKey)}`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Wallet connection failed:", error)
      toast.error("Connection Failed", {
        description: error instanceof Error ? error.message : "Failed to connect wallet",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            XPay
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-2">
            Stellar Payment Gateway
          </p>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Connect your Stellar wallet to access secure, fast, and decentralized payment processing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Features Section */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Secure & Decentralized
                </h3>
                <p className="text-slate-600">
                  Built on Stellar blockchain with end-to-end encryption and decentralized architecture
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Lightning Fast
                </h3>
                <p className="text-slate-600">
                  Process payments in seconds with Stellar's high-performance network
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Multi-Currency Support
                </h3>
                <p className="text-slate-600">
                  Accept payments in XLM, USDC, and other Stellar assets
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader className="text-center space-y-4 px-6 pt-8 pb-6">
                <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Connect Wallet
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm sm:text-base mt-2">
                    Connect your Stellar wallet to get started
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 pb-8 space-y-6">
                <Button
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-5 w-5" />
                      <span>Connect Stellar Wallet</span>
                    </div>
                  )}
                </Button>

                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-3 bg-white text-sm text-slate-500">
                      Supported Wallets
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-sm text-slate-600">
                  <div className="p-3 border border-slate-200 rounded-lg bg-white/50">
                    <strong>Freighter</strong>
                    <p className="text-xs">Browser Extension</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-white/50">
                    <strong>LOBSTR</strong>
                    <p className="text-xs">Mobile & Web</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-white/50">
                    <strong>Rabet</strong>
                    <p className="text-xs">Browser Extension</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-white/50">
                    <strong>xBull</strong>
                    <p className="text-xs">Browser Extension</p>
                  </div>
                </div>

                <p className="text-xs text-center text-slate-500">
                  By connecting, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
