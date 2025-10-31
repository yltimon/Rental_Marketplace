'use client';

import { useState } from "react";
import { Search, MapPin, TrendingUp, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RenterLandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const name = typeof window !== "undefined" ? localStorage.getItem("name") : "Renter";
  const fname = name ? name.split(" ")[0] : "Renter";

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-90" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-700" />
      
      <div className="relative z-10 container mx-auto px-4 text-center py-20">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
              Welcome back, <span className="text-yellow-300">{fname}!</span>
            </h1>
            <p className="text-xl text-white/90 mb-2">
              Your next rental is just a search away
            </p>
            <p className="text-lg text-white/70">
              Browse thousands of items available in your area
            </p>
          </div>

          {/* Search Card */}
          <Card className="bg-white/95 backdrop-blur-lg p-8 shadow-2xl border-0 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  placeholder="What do you want to rent?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                />
              </div>
              <div className="flex-1 relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-600 transition-colors" />
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all"
                />
              </div>
              <Button 
                size="lg" 
                className="h-14 px-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-semibold"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">10K+</p>
                <p className="text-sm text-gray-600">Active Listings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-sm text-gray-600">Secure Payments</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">24/7</p>
                <p className="text-sm text-gray-600">Support</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}