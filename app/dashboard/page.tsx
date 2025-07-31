"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, LogOut, User, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import stellarWalletService from "@/lib/stellar-wallet"
import stellarService, { PaymentData } from "@/lib/stellar-service"
import { toast } from "sonner"

export default function DashboardPage() {
  const [selectedToken, setSelectedToken] = useState("XLM")
  const [balances, setBalances] = useState<{ [asset: string]: number }>({})
  const [balance, setBalance] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
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
      const publicKey = localStorage.getItem("stellar_public_key")
      setWalletPublicKey(publicKey)
      
      // Load Stellar data when wallet is connected
      if (publicKey) {
        loadWalletData(publicKey)
      }
    }
  }, [router])

  // Load real Stellar account data
  const loadWalletData = async (publicKey: string) => {
    await Promise.all([
      loadAccountBalances(publicKey),
      loadAccountPayments(publicKey)
    ])
  }

  // Load account balances from Stellar network
  const loadAccountBalances = async (publicKey: string) => {
    setIsLoadingBalances(true)
    try {
      console.log('Loading account balances for:', publicKey)
      const accountBalances = await stellarService.getAccountBalances(publicKey)
      console.log('Loaded balances:', accountBalances)
      
      setBalances(accountBalances)
      
      // Set the balance for the selected token
      const selectedBalance = accountBalances[selectedToken] || 0
      setBalance(selectedBalance)
      
      setLastUpdate(new Date())
      
      toast.success("Balances Updated", {
        description: `Loaded balances from Stellar network`,
      })
    } catch (error) {
      console.error('Error loading balances:', error)
      toast.error("Failed to Load Balances", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoadingBalances(false)
    }
  }

  // Load account payments from Stellar network
  const loadAccountPayments = async (publicKey: string) => {
    setIsLoadingPayments(true)
    try {
      console.log('Loading account payments for:', publicKey)
      const accountPayments = await stellarService.getPaymentsForAccount(publicKey, 10)
      console.log('Loaded payments:', accountPayments)
      
      setPayments(accountPayments)
      
      toast.success("Payments Updated", {
        description: `Loaded ${accountPayments.length} payments from Stellar network`,
      })
    } catch (error) {
      console.error('Error loading payments:', error)
      toast.error("Failed to Load Payments", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoadingPayments(false)
    }
  }

  // Refresh data manually
  const handleRefreshData = () => {
    if (walletPublicKey) {
      loadWalletData(walletPublicKey)
    }
  }

  // Update balance when selected token changes
  useEffect(() => {
    const selectedBalance = balances[selectedToken] || 0
    setBalance(selectedBalance)
  }, [selectedToken, balances])

  // Monitor wallet connection status in real-time
  useEffect(() => {
    const checkWalletConnection = () => {
      const isWalletConnected = stellarWalletService.isConnected()
      const publicKey = stellarWalletService.getPublicKey()
      
      setWalletConnected(isWalletConnected)
      setWalletPublicKey(publicKey)
      
      // If wallet is disconnected and no traditional auth, redirect to login
      const isAuth = localStorage.getItem("isAuthenticated")
      if (!isWalletConnected && !isAuth) {
        toast.error("Wallet disconnected. Please login again.")
        router.push("/login")
      }
    }

    // Check immediately
    checkWalletConnection()
    
    // Check every 2 seconds for wallet connection changes
    const interval = setInterval(checkWalletConnection, 2000)
    
    return () => clearInterval(interval)
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
        {status === "completed" ? "Completed" : status === "pending" ? "Pending" : "Converting"}
      </Badge>
    )
  }

  const simulatePayment = () => {
    const newPayment: PaymentData = {
      id: Date.now().toString(),
      date: new Date().toLocaleString("en-US"),
      amount: Math.floor(Math.random() * 500) + 10,
      token: ["XLM", "USDC", "AQUA"][Math.floor(Math.random() * 3)],
      status: "pending",
      hash: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 8)}`,
      direction: "incoming",
      operation_type: "payment"
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
          <p className="text-slate-600 text-sm sm:text-base">Manage your crypto payments on Stellar</p>
        </div>
        <Button
          onClick={simulatePayment}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-10 sm:h-11 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          Simulate Payment
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
              <CardTitle className="text-lg sm:text-xl">Total Balance</CardTitle>
              {isLoadingBalances && (
                <RefreshCw className="w-4 h-4 animate-spin opacity-70" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="w-20 sm:w-24 bg-white/20 border-white/30 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(balances).length > 0 ? (
                    Object.keys(balances).map(token => (
                      <SelectItem key={token} value={token}>{token}</SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="XLM">XLM</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="AQUA">AQUA</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleRefreshData}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1.5"
                disabled={isLoadingBalances || isLoadingPayments}
              >
                <RefreshCw className={`w-4 h-4 ${(isLoadingBalances || isLoadingPayments) ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold">
              {isLoadingBalances ? '...' : balance.toFixed(7)}
            </span>
            <span className="text-lg sm:text-xl opacity-90">{selectedToken}</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-green-200">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              {lastUpdate ? `Updated: ${lastUpdate.toLocaleTimeString()}` : 'Connect wallet to view data'}
            </span>
          </div>
          {Object.keys(balances).length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs opacity-70 mb-2">All tokens:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(balances).map(([token, balance]) => (
                  <div key={token} className="bg-white/20 rounded px-2 py-1 text-xs">
                    {balance.toFixed(2)} {token}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recent Payments</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Latest transactions from your Stellar account
              </CardDescription>
            </div>
            {isLoadingPayments && (
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 && !isLoadingPayments ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Connect your wallet to view history</p>
            </div>
          ) : (
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
                        {payment.direction === 'incoming' ? '+' : '-'}{payment.amount.toFixed(7)} {payment.token}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {payment.date} • {payment.operation_type}
                      </p>
                      {payment.from_account && payment.to_account && (
                        <p className="text-xs text-slate-400">
                          {payment.direction === 'incoming' ? 'From' : 'To'}: {stellarWalletService.formatPublicKey(
                            payment.direction === 'incoming' ? payment.from_account : payment.to_account
                          )}
                        </p>
                      )}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
