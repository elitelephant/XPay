"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Copy, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [preferredToken, setPreferredToken] = useState("USDC")
  const [autoConvert, setAutoConvert] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [merchantName, setMerchantName] = useState("Mi Comercio")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const checkoutUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkout/demo-merchant`

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("isAuthenticated")
    if (!isAuth) {
      router.push("/login")
    }

    // Load saved settings
    const savedSettings = localStorage.getItem("merchantSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setPreferredToken(settings.preferredToken || "USDC")
      setAutoConvert(settings.autoConvert ?? true)
      setWebhookUrl(settings.webhookUrl || "")
      setMerchantName(settings.merchantName || "Mi Comercio")
    }
  }, [router])

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const settings = {
      preferredToken,
      autoConvert,
      webhookUrl,
      merchantName,
    }

    localStorage.setItem("merchantSettings", JSON.stringify(settings))

    setIsLoading(false)
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas correctamente.",
    })
  }

  const copyCheckoutUrl = () => {
    navigator.clipboard.writeText(checkoutUrl)
    toast({
      title: "URL copiada",
      description: "La URL de checkout ha sido copiada al portapapeles.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600">Personaliza las preferencias de tu comercio</p>
      </div>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de Pagos
          </CardTitle>
          <CardDescription>Define cómo quieres recibir y procesar los pagos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="preferred-token">Token Preferido</Label>
              <Select value={preferredToken} onValueChange={setPreferredToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XLM">XLM (Stellar Lumens)</SelectItem>
                  <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                  <SelectItem value="AQUA">AQUA</SelectItem>
                  <SelectItem value="yXLM">yXLM</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500">Los pagos se convertirán automáticamente a este token</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant-name">Nombre del Comercio</Label>
              <Input
                id="merchant-name"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Nombre de tu negocio"
              />
              <p className="text-sm text-slate-500">Aparecerá en la página de checkout</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Conversión Automática</Label>
              <p className="text-sm text-slate-500">Convierte automáticamente todos los pagos al token preferido</p>
            </div>
            <Switch checked={autoConvert} onCheckedChange={setAutoConvert} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL (Opcional)</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://tu-sitio.com/webhook"
              type="url"
            />
            <p className="text-sm text-slate-500">Recibe notificaciones de pagos en tiempo real</p>
          </div>
        </CardContent>
      </Card>

      {/* Checkout URL */}
      <Card>
        <CardHeader>
          <CardTitle>URL de Checkout</CardTitle>
          <CardDescription>Comparte esta URL con tus clientes para recibir pagos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={checkoutUrl} readOnly className="font-mono text-sm bg-slate-50" />
            <Button variant="outline" size="icon" onClick={copyCheckoutUrl}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => window.open(checkoutUrl, "_blank")}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </div>
  )
}
