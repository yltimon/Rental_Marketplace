// NoUserLandingPage.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function NoUserLandingPage() {
  return (
    <section className="relative min-h-[500px] flex items-center justify-center gradient-hero">
      <div className="absolute inset-0 bg-blue-600 opacity-20" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome to <span className="text-primary-light">Rent Marketplace</span>
          </h1>
          <p className="text-xl text-white/90 mb-10">
            Sign up or log in to start renting or listing items. Discover a world of possibilities!
          </p>
          <Card className="gradient-card p-6 max-w-2xl mx-auto shadow-2xl border-0">
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="lg" className="h-12 px-8">
                  Create Account
                </Button>
              </Link>
            </div>
          </Card>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { name: "Browse Items", emoji: "🔍" },
              { name: "How It Works", emoji: "❓" },
              { name: "Categories", emoji: "🗂️" },
              { name: "Contact Us", emoji: "📞" },
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