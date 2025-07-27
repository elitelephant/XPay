"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Copy, AlertCircle, Loader2, LogOut, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import stellarWalletService from "@/lib/stellar-wallet"

interface CheckoutData {
  merchantName: string
  amount: number
  currency: string
  description?: string
}

export default function CheckoutPage() {
  const params = useParams()
  const { toast } = useToast()
  const [selectedToken, setSelectedToken] = useState("XLM")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "waiting" | "processing" | "completed">("idle")
  const [walletConnected, setWalletConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showPaymentScreen, setShowPaymentScreen] = useState(false)
  const [checkoutData] = useState<CheckoutData>({
    merchantName: "Demo Store",
    amount: 25.99,
    currency: "USD",
    description: "Digital product purchase",
  })

  const stellarAddress = "GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY62SLY"
  const paymentMemo = `PAY-${Date.now()}`

  const tokenRates = {
    XLM: 0.12,
    USDC: 1.0,
    AQUA: 0.08,
  }

  const calculateAmount = () => {
    const rate = tokenRates[selectedToken as keyof typeof tokenRates]
    return (checkoutData.amount / rate).toFixed(6)
  }

  useEffect(() => {
    setWalletConnected(stellarWalletService.isConnected())
  }, [])

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      await stellarWalletService.connectWallet()
      setWalletConnected(true)
      toast({
        title: "Wallet Connected",
        description: "Your Stellar wallet is now connected",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await stellarWalletService.disconnectWallet()
      setWalletConnected(false)
      setPaymentStatus("idle")
      setShowPaymentScreen(false)
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  const handleBackToCheckout = () => {
    setShowPaymentScreen(false)
    setPaymentStatus("idle")
  }

  const handlePayment = async () => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    // Switch directly to payment success screen
    setShowPaymentScreen(true)
    setPaymentStatus("completed")
    
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully",
    })
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(stellarAddress)
    toast({
      title: "Address copied",
      description: "Payment address copied to clipboard",
    })
  }

  const copyMemo = () => {
    navigator.clipboard.writeText(paymentMemo)
    toast({
      title: "Memo copied",
      description: "Payment memo copied to clipboard",
    })
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "waiting":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "processing":
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (paymentStatus) {
      case "waiting":
        return "Waiting for payment..."
      case "processing":
        return "Processing payment..."
      case "completed":
        return "Payment completed!"
      default:
        return ""
    }
  }

  // Payment Processing Screen
  if (showPaymentScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{checkoutData.merchantName}</h1>
            <p className="text-slate-600 text-sm mt-1">Payment completed</p>
          </div>

          {/* Success Screen */}
          <Card className="border-green-200 bg-green-50 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-3">Payment Successful!</h3>
              <p className="text-green-700 mb-4">
                Your payment of <span className="font-semibold">${checkoutData.amount}</span> has been processed successfully.
              </p>
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-sm">
                Transaction completed
              </Badge>
              
              {/* Payment details */}
              <div className="mt-6 bg-white/50 rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Amount:</span>
                  <span className="font-medium text-green-800">${checkoutData.amount} USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Token:</span>
                  <span className="font-medium text-green-800">{calculateAmount()} {selectedToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Wallet:</span>
                  <span className="font-mono text-xs text-green-800">{stellarWalletService.formatPublicKey()}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-green-200">
                <p className="text-green-600 text-sm">
                  You can close this window or will be redirected shortly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-slate-500 space-y-1">
            <p>Powered by XPay</p>
            <p>Secure payments on Stellar network</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{checkoutData.merchantName}</h1>
          <p className="text-slate-600 text-sm mt-1">{checkoutData.description}</p>
        </div>

        <Card className="mb-3 sm:mb-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">${checkoutData.amount}</div>
              <p className="text-slate-600 text-sm">Amount to pay</p>
            </div>
          </CardContent>
        </Card>

        {!walletConnected ? (
          <Card className="mb-3 sm:mb-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Connect Wallet
              </CardTitle>
              <CardDescription className="text-sm">
                Connect your Stellar wallet to proceed with the payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Connect Stellar Wallet
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-3 sm:mb-4 shadow-lg border-0 bg-green-50 border-green-200">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Wallet Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-700">
                      {stellarWalletService.formatPublicKey()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnectWallet}
                      className="h-6 w-6 p-0 text-green-700 hover:text-green-900 hover:bg-green-100"
                      disabled={paymentStatus !== "idle"}
                    >
                      <LogOut className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-3 sm:mb-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Select token</CardTitle>
                <CardDescription className="text-sm">Choose which asset to pay with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedToken} onValueChange={setSelectedToken} disabled={paymentStatus !== "idle"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XLM">XLM (Stellar Lumens)</SelectItem>
                    <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                    <SelectItem value="AQUA">AQUA</SelectItem>
                  </SelectContent>
                </Select>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Amount to pay:</span>
                    <span className="font-mono font-medium text-sm">
                      {calculateAmount()} {selectedToken}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentStatus === "idle" && (
              <Card className="mb-3 sm:mb-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <Button
                    onClick={handlePayment}
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm font-medium"
                  >
                    Pay with Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="text-center mt-4 sm:mt-6 text-xs text-slate-500 space-y-1">
          <p>Powered by XPay</p>
          <p>Secure payments on Stellar network</p>
        </div>
      </div>
    </div>
  )
}
