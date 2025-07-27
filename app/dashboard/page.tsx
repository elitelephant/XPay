"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import stellarWalletService from "@/lib/stellar-wallet"
import { toast } from "sonner"

interface Payment {
  id: string
  date: string
  amount: number
  token: string
  status: "completed" | "pending" | "converting"
  hash: string
}

export default function DashboardPage() {
  const [selectedToken, setSelectedToken] = useState("XLM")
  const [balance, setBalance] = useState(1250.75)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      date: "2024-01-15 14:30",
      amount: 100.5,
      token: "USDC",
      status: "completed",
      hash: "abc123...def456",
    },
    {
      id: "2",
      date: "2024-01-15 12:15",
      amount: 50.25,
      token: "XLM",
      status: "converting",
      hash: "ghi789...jkl012",
    },
    {
      id: "3",
      date: "2024-01-14 16:45",
      amount: 200.0,
      token: "USDC",
      status: "pending",
      hash: "mno345...pqr678",
    },
  ])
  const router = useRouter()

  useEffect(() => {
    // Check authentication - support both old email auth and new wallet auth
    const isAuth = localStorage.getItem("isAuthenticated")
    const isWalletConnected = localStorage.getItem("stellar_wallet_connected") === "true"
    
    if (!isAuth && !isWalletConnected) {
      router.push("/login")
      return
    }

    // Set wallet connection state
    if (isWalletConnected) {
      setWalletConnected(true)
      setWalletPublicKey(localStorage.getItem("stellar_public_key"))
    }
  }, [router])

  const handleDisconnectWallet = async () => {
    try {
      await stellarWalletService.disconnectWallet()
      
      // Clear all auth states
      localStorage.removeItem("isAuthenticated")
      
      toast.success("Wallet disconnected successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to disconnect wallet")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "converting":
        return <AlertCircle className="w-4 h-4 text-blue-500" />
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

  const simulatePayment = () => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      date: new Date().toLocaleString("es-ES"),
      amount: Math.floor(Math.random() * 500) + 10,
      token: ["XLM", "USDC", "AQUA"][Math.floor(Math.random() * 3)],
      status: "pending",
      hash: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 8)}`,
    }

    setPayments((prev) => [newPayment, ...prev])

    // Simulate status changes
    setTimeout(() => {
      setPayments((prev) => prev.map((p) => (p.id === newPayment.id ? { ...p, status: "converting" } : p)))
    }, 2000)

    setTimeout(() => {
      setPayments((prev) => prev.map((p) => (p.id === newPayment.id ? { ...p, status: "completed" } : p)))
      setBalance((prev) => prev + newPayment.amount)
    }, 4000)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 text-sm sm:text-base">Gestiona tus pagos cripto en Stellar</p>
        </div>
        <Button
          onClick={simulatePayment}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-10 sm:h-11 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          Simular Pago
        </Button>
      </div>

      {/* Wallet Connection Status */}
      {walletConnected && (
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Stellar Wallet Connected</p>
                  <p className="text-sm text-green-700">
                    {walletPublicKey ? stellarWalletService.formatPublicKey(walletPublicKey) : "Connected"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDisconnectWallet}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <CardTitle className="text-lg sm:text-xl">Saldo Total</CardTitle>
            </div>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="w-20 sm:w-24 bg-white/20 border-white/30 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XLM">XLM</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="AQUA">AQUA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold">{balance.toFixed(2)}</span>
            <span className="text-lg sm:text-xl opacity-90">{selectedToken}</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-green-200">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12.5% este mes</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Pagos Recientes</CardTitle>
          <CardDescription className="text-sm sm:text-base">Últimas transacciones recibidas en tu comercio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer gap-3 sm:gap-4"
                onClick={() => router.push(`/payment/${payment.id}`)}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium text-slate-900 text-sm sm:text-base">
                        {payment.amount} {payment.token}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">{payment.date}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-slate-500 font-mono break-all sm:break-normal">{payment.hash}</p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
