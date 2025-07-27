"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Store auth state in localStorage for demo
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("merchantEmail", email)

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto relative z-10">
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="text-center space-y-4 px-6 pt-8 pb-6">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StellarPay
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm sm:text-base mt-2">Accede a tu dashboard de pagos cripto</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-sm sm:text-base font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="comercio@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-11 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 text-sm sm:text-base font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-11 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-sm sm:text-base mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-500">Demo: usa cualquier email y contraseña</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
