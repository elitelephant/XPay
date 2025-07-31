"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, ExternalLink, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentDetail {
  id: string
  date: string
  amount: number
  token: string
  status: "completed" | "pending" | "converting"
  hash: string
  fromAddress: string
  toAddress: string
  fee: number
  confirmations: number
  network: string
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [payment, setPayment] = useState<PaymentDetail | null>(null)

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("isAuthenticated")
    if (!isAuth) {
      router.push("/login")
      return
    }

    // Simulate payment detail fetch
    const mockPayment: PaymentDetail = {
      id: params.id as string,
      date: "2024-01-15 14:30:25",
      amount: 100.5,
      token: "USDC",
      status: "completed",
      hash: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
      fromAddress: "GCKFBEIYTKP74Q7T2HFYJOQYQIR2XZFZ2ASAFVY6WNXN2NNQVQHQ",
      toAddress: "GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY62SLY",
      fee: 0.00001,
      confirmations: 12,
      network: "Stellar Mainnet",
    }

    setPayment(mockPayment)
  }, [params.id, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "converting":
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      converting: "bg-blue-100 text-blue-800 border-blue-200",
    }

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {status === "completed" ? "Completed" : status === "pending" ? "Pending" : "Converting"}
      </Badge>
    )
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles.`,
    })
  }

  const openInExplorer = (hash: string) => {
    window.open(`https://stellar.expert/explorer/public/tx/${hash}`, "_blank")
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Detalle de Pago</h1>
          <p className="text-slate-600 text-sm sm:text-base">Información completa de la transacción</p>
        </div>
      </div>

      {/* Payment Overview */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(payment.status)}
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  {payment.amount} {payment.token}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">{payment.date}</CardDescription>
              </div>
            </div>
            <div className="self-start sm:self-auto">
              {getStatusBadge(payment.status)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Transaction Details */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Detalles de la Transacción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Hash de Transacción</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <code className="flex-1 p-2 sm:p-3 bg-slate-100 rounded text-xs sm:text-sm font-mono break-all">
                    {payment.hash}
                  </code>
                  <div className="flex gap-2 self-stretch sm:self-auto">
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(payment.hash, "Hash")} className="h-9 sm:h-10 w-9 sm:w-10">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openInExplorer(payment.hash)} className="h-9 sm:h-10 w-9 sm:w-10">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Dirección de Origen</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <code className="flex-1 p-2 sm:p-3 bg-slate-100 rounded text-xs sm:text-sm font-mono break-all">
                    {payment.fromAddress}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(payment.fromAddress, "Dirección de origen")}
                    className="h-9 sm:h-10 w-9 sm:w-10 self-stretch sm:self-auto"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Dirección de Destino</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <code className="flex-1 p-2 sm:p-3 bg-slate-100 rounded text-xs sm:text-sm font-mono break-all">
                    {payment.toAddress}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(payment.toAddress, "Dirección de destino")}
                    className="h-9 sm:h-10 w-9 sm:w-10 self-stretch sm:self-auto"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Red</label>
                  <p className="mt-1 p-2 sm:p-3 bg-slate-100 rounded text-xs sm:text-sm">{payment.network}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Confirmaciones</label>
                  <p className="mt-1 p-2 sm:p-3 bg-slate-100 rounded text-xs sm:text-sm">{payment.confirmations}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Comisión</label>
                  <p className="mt-1 p-2 sm:p-3 bg-slate-100 rounded text-xs sm:text-sm">{payment.fee} XLM</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Asset</label>
                  <p className="mt-1 p-2 sm:p-3 bg-slate-100 rounded text-xs sm:text-sm">{payment.token}</p>
                </div>
              </div>

              {payment.status === "converting" && (
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-medium text-blue-800">Conversion in Progress</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    The payment is being converted to your preferred token. This may take a few minutes.
                  </p>
                </div>
              )}

              {payment.status === "completed" && (
                <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-green-800">Payment Completed</span>
                  </div>
                  <p className="text-xs sm:text-sm text-green-700 mt-1">
                    Payment has been processed successfully and added to your balance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
