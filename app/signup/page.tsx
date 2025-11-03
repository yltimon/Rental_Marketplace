'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Users, Store, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [open, setOpen] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "renter" // "renter" or "owner"
  })

  const router = useRouter();

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json()
      if (!response.ok) {
        console.log('Signup failed:', data.error)
        alert(data.error || 'Signup failed. Please try again.')
        return
      } else {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", data.user.role)
        localStorage.setItem("name", data.user.name)
        localStorage.setItem("userId", data.user._id);
        window.dispatchEvent(new Event("authChange"))
        router.push("/")
      }
      setOpen(false)

    }catch (error) {
      console.error('An unexpected error occurred:', error)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <button
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <Card className="gradient-card shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join Today</CardTitle>
            <CardDescription>Create your account to start renting or hosting</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I want to...</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => updateFormData("role", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="renter"
                      id="renter"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="renter"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Users className="mb-3 h-6 w-6" />
                      Rent items
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="owner"
                      id="owner"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="owner"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Store className="mb-3 h-6 w-6" />
                      Host items
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="link" 
                className="w-full" 
                size="lg"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="mb-6" />
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}