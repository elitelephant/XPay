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
        {status === "completed" ? "Completado" : status === "pending" ? "Pendiente" : "Convirtiendo"}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Detalle de Pago</h1>
          <p className="text-slate-600">Información completa de la transacción</p>
        </div>
      </div>

      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(payment.status)}
              <div>
                <CardTitle className="text-2xl">
                  {payment.amount} {payment.token}
                </CardTitle>
                <CardDescription>{payment.date}</CardDescription>
              </div>
            </div>
            {getStatusBadge(payment.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Transacción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Hash de Transacción</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-slate-100 rounded text-sm font-mono break-all">{payment.hash}</code>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(payment.hash, "Hash")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openInExplorer(payment.hash)}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Dirección de Origen</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-slate-100 rounded text-sm font-mono break-all">
                    {payment.fromAddress}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(payment.fromAddress, "Dirección de origen")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Dirección de Destino</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-slate-100 rounded text-sm font-mono break-all">
                    {payment.toAddress}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(payment.toAddress, "Dirección de destino")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Red</label>
                  <p className="mt-1 p-2 bg-slate-100 rounded text-sm">{payment.network}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Confirmaciones</label>
                  <p className="mt-1 p-2 bg-slate-100 rounded text-sm">{payment.confirmations}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Comisión</label>
                  <p className="mt-1 p-2 bg-slate-100 rounded text-sm">{payment.fee} XLM</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Asset</label>
                  <p className="mt-1 p-2 bg-slate-100 rounded text-sm">{payment.token}</p>
                </div>
              </div>

              {payment.status === "converting" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Conversión en Progreso</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    El pago está siendo convertido a tu token preferido. Esto puede tomar unos minutos.
                  </p>
                </div>
              )}

              {payment.status === "completed" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Pago Completado</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    El pago ha sido procesado exitosamente y agregado a tu saldo.
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
