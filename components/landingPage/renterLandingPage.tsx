'use client';


import { useState } from "react";
import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RenterLandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  // Get renter's first name from localStorage
  const name = typeof window !== "undefined" ? localStorage.getItem("name") : "Renter";

  const fname = name ? name.split(" ")[0] : ["Renter"];

  return (
    <section className="relative min-h-[500px] flex items-center justify-center gradient-hero">
      <div className="absolute inset-0 bg-blue-600 opacity-20" /> 
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome, <span className="text-primary-light">{fname}</span>
          </h1>
          <p className="text-xl text-white/90 mb-10">
            Find and book anything you need, from electronics to vehicles, right here.
          </p>
          <Card className="gradient-card p-6 max-w-2xl mx-auto shadow-2xl border-0">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="What do you want to rent?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-2"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-12 text-lg border-2"
                />
              </div>
              <Button variant="link" size="lg" className="h-12 px-12">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </Card>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { name: "My Bookings", emoji: "📅" },
              { name: "Reviews", emoji: "💬" },
              { name: "Profile", emoji: "👤" },
            ].map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="h-auto p-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white flex flex-col items-center space-y-2 transition-smooth"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}