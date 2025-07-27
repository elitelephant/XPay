"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, CheckCircle, Clock, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [checkoutData] = useState<CheckoutData>({
    merchantName: "Demo Store",
    amount: 25.99,
    currency: "USD",
    description: "Compra de producto digital",
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

  const handlePayment = () => {
    setPaymentStatus("waiting")

    // Simulate payment flow
    setTimeout(() => {
      setPaymentStatus("processing")
    }, 3000)

    setTimeout(() => {
      setPaymentStatus("completed")
      toast({
        title: "¡Pago completado!",
        description: "Tu pago ha sido procesado exitosamente.",
      })
    }, 6000)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(stellarAddress)
    toast({
      title: "Dirección copiada",
      description: "La dirección de pago ha sido copiada al portapapeles.",
    })
  }

  const copyMemo = () => {
    navigator.clipboard.writeText(paymentMemo)
    toast({
      title: "Memo copiado",
      description: "El memo de pago ha sido copiado al portapapeles.",
    })
  }

  const openWallet = (wallet: string) => {
    const amount = calculateAmount()
    let url = ""

    switch (wallet) {
      case "freighter":
        url = `web+stellar:pay?destination=${stellarAddress}&amount=${amount}&asset_code=${selectedToken}&memo=${paymentMemo}`
        break
      case "albedo":
        url = `https://albedo.link/intent?tx=payment&destination=${stellarAddress}&amount=${amount}&asset_code=${selectedToken}&memo=${paymentMemo}`
        break
    }

    if (url) {
      window.open(url, "_blank")
    }
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
        return "Esperando pago..."
      case "processing":
        return "Procesando pago..."
      case "completed":
        return "¡Pago completado!"
      default:
        return "Listo para pagar"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{checkoutData.merchantName}</h1>
          <p className="text-slate-600">{checkoutData.description}</p>
        </div>

        {/* Payment Amount */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">${checkoutData.amount}</div>
              <p className="text-slate-600">Monto a pagar</p>
            </div>
          </CardContent>
        </Card>

        {/* Token Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Selecciona tu token</CardTitle>
            <CardDescription>Elige con qué activo quieres pagar</CardDescription>
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

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Cantidad a pagar:</span>
                <span className="font-mono font-medium">
                  {calculateAmount()} {selectedToken}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              {getStatusIcon()}
              <span className="font-medium text-slate-900">{getStatusText()}</span>
            </div>

            {paymentStatus !== "idle" && paymentStatus !== "completed" && (
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: paymentStatus === "waiting" ? "33%" : paymentStatus === "processing" ? "66%" : "100%",
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {paymentStatus === "idle" && (
          <>
            {/* Payment Methods */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Métodos de pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-transparent"
                  onClick={() => openWallet("freighter")}
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Wallet className="w-4 h-4 text-orange-600" />
                  </div>
                  Pagar con Freighter
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-transparent"
                  onClick={() => openWallet("albedo")}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  Pagar con Albedo
                </Button>
              </CardContent>
            </Card>

            {/* Manual Payment */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Pago Manual</CardTitle>
                <CardDescription>Copia los datos y realiza el pago desde tu wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Dirección de destino</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-slate-100 rounded text-xs font-mono break-all">
                      {stellarAddress}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyAddress}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Cantidad</label>
                    <div className="mt-1 p-2 bg-slate-100 rounded text-sm font-mono">
                      {calculateAmount()} {selectedToken}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Memo</label>
                    <div className="flex items-center gap-1 mt-1">
                      <code className="flex-1 p-2 bg-slate-100 rounded text-xs font-mono">{paymentMemo}</code>
                      <Button variant="outline" size="icon" onClick={copyMemo}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Simular Pago Recibido
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {paymentStatus === "completed" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">¡Pago Exitoso!</h3>
              <p className="text-green-700 mb-4">Tu pago ha sido procesado correctamente.</p>
              <Badge className="bg-green-100 text-green-800 border-green-200">Transacción completada</Badge>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Powered by StellarPay</p>
          <p>Pagos seguros en la red Stellar</p>
        </div>
      </div>
    </div>
  )
}
