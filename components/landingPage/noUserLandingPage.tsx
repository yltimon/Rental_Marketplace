import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shield, Zap, Heart } from "lucide-react";
import Link from "next/link";

export default function NoUserLandingPage() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-300" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-700" />
      
      <div className="relative z-10 container mx-auto px-4 text-center py-20">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
              Welcome to <span className="text-yellow-300">Rent Marketplace</span>
            </h1>
            <p className="text-xl text-white/90 mb-2">
              The marketplace where anything can be rented
            </p>
            <p className="text-lg text-white/70">
              Join thousands of renters and owners today
            </p>
          </div>

          {/* Action Card */}
          <Card className="bg-white/95 backdrop-blur-lg p-8 shadow-2xl border-0 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
              <Link href="/login" className="flex-1">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-14 border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 rounded-xl text-lg font-semibold transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button 
                  size="lg" 
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-semibold"
                >
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Platform</h3>
                <p className="text-sm text-gray-600">Your transactions are protected</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Instant Booking</h3>
                <p className="text-sm text-gray-600">Rent in minutes, not hours</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Trusted Community</h3>
                <p className="text-sm text-gray-600">Verified users and reviews</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}