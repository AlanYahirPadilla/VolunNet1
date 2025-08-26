"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Smartphone, Loader2 } from "lucide-react"

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => Promise<void>
  type: "email" | "phone"
  isLoading: boolean
}

export function VerificationModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  type, 
  isLoading 
}: VerificationModalProps) {
  const [code, setCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      await onVerify(code.trim())
      setCode("")
    }
  }

  const handleClose = () => {
    setCode("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "email" ? (
              <Mail className="h-5 w-5 text-blue-500" />
            ) : (
              <Smartphone className="h-5 w-5 text-green-500" />
            )}
            Verificar {type === "email" ? "Correo Electrónico" : "Teléfono"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="verification-code" className="text-sm font-medium text-gray-700">
              Código de verificación
            </Label>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Ingresa el código de 6 dígitos que recibiste por {type === "email" ? "correo electrónico" : "SMS"}
            </p>
            <Input
              id="verification-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="text-center text-lg font-mono tracking-widest"
              maxLength={6}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!code.trim() || code.length !== 6 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}




