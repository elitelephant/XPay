"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, CheckCircle, Clock, Copy, AlertCircle, Loader2 } from "lucide-react"
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

  const handlePayment = async () => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setPaymentStatus("waiting")

    try {
      setTimeout(() => {
        setPaymentStatus("processing")
      }, 2000)

      setTimeout(() => {
        setPaymentStatus("completed")
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        })
      }, 5000)
    } catch (error) {
      setPaymentStatus("idle")
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment failed",
        variant: "destructive",
      })
    }
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
        return <Wallet className="w-5 h-5 text-slate-500" />
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
        return "Ready to pay"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{checkoutData.merchantName}</h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1">{checkoutData.description}</p>
        </div>

        <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">${checkoutData.amount}</div>
              <p className="text-slate-600 text-sm sm:text-base">Amount to pay</p>
            </div>
          </CardContent>
        </Card>

        {!walletConnected ? (
          <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Connect Wallet
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Connect your Stellar wallet to proceed with the payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base font-medium"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Connect Stellar Wallet
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Wallet Connected</span>
                  <span className="text-xs ml-auto">
                    {stellarWalletService.formatPublicKey()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Select token</CardTitle>
                <CardDescription className="text-sm sm:text-base">Choose which asset to pay with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-slate-600">Amount to pay:</span>
                    <span className="font-mono font-medium text-sm sm:text-base">
                      {calculateAmount()} {selectedToken}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {getStatusIcon()}
                  <span className="font-medium text-slate-900 text-sm sm:text-base">{getStatusText()}</span>
                </div>

                {paymentStatus !== "idle" && paymentStatus !== "completed" && (
                  <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-1000"
                      style={{
                        width: paymentStatus === "waiting" ? "33%" : paymentStatus === "processing" ? "66%" : "100%",
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {paymentStatus === "idle" && (
              <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <Button
                    onClick={handlePayment}
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base font-medium"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Pay with Wallet
                  </Button>
                </CardContent>
              </Card>
            )}

            {paymentStatus === "completed" && (
              <Card className="border-green-200 bg-green-50 shadow-lg backdrop-blur-sm">
                <CardContent className="pt-6 pb-6 text-center">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
                  <p className="text-green-700 mb-4 text-sm sm:text-base">Your payment has been processed successfully.</p>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-sm sm:text-base px-3 py-1">
                    Transaction completed
                  </Badge>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-slate-500 space-y-1">
          <p>Powered by XPay</p>
          <p>Secure payments on Stellar network</p>
        </div>
      </div>
    </div>
  )
}
