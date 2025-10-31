import { useRouter } from "next/navigation";
import { PlusCircle, ClipboardList, TrendingUp, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OwnerLandingPage() {
  const name = typeof window !== "undefined" ? localStorage.getItem("name") : "Owner";
  const router = useRouter();
  const fname = name ? name.split(" ")[0] : "Owner";

  const handleAddListing = () => {
    router.push("/dashboard/add-listing");
  };

  const handleViewListings = () => {
    router.push("/dashboard/my-listings");
  };
  
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 opacity-90" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-500" />
      
      <div className="relative z-10 container mx-auto px-4 text-center py-20">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
              Welcome back, <span className="text-yellow-300">{fname}!</span>
            </h1>
            <p className="text-xl text-white/90 mb-2">
              Manage your empire, track your earnings
            </p>
            <p className="text-lg text-white/70">
              Your listings, your rules, your success
            </p>
          </div>

          {/* Action Card */}
          <Card className="bg-white/95 backdrop-blur-lg p-8 shadow-2xl border-0 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
              <Button 
                size="lg" 
                onClick={handleAddListing}
                className="h-14 px-10 flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-semibold"
              >
                <PlusCircle className="h-5 w-5 mr-3" />
                Add New Listing
              </Button>
              <Button 
                size="lg" 
                onClick={handleViewListings}
                variant="outline"
                className="h-14 px-10 flex-1 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-lg font-semibold transition-all"
              >
                <ClipboardList className="h-5 w-5 mr-3" />
                View My Listings
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">$0</p>
                <p className="text-sm text-gray-600">Total Earnings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Active Listings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-cyan-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Total Renters</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}