
import { useRouter } from "next/navigation";
import { PlusCircle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OwnerLandingPage() {

  // Get owner's first name from localStorage
  const name = typeof window !== "undefined" ? localStorage.getItem("name") : "Owner!";

  const route = useRouter();
  const fname = name ? name.split(" ")[0] : ["Owner!"];

  const handleAddListing = () => {
    route.push("/dashboard/add-listing");
  };

  const handleViewListings = () => {
    route.push("/dashboard/my-listings");
  };
  
  return (
    <section className="relative min-h-[500px] flex items-center justify-center gradient-hero">
      <div className="absolute inset-0 bg-blue-600 opacity-20" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome, <span className="text-primary-light">{fname}</span>
          </h1>
          <p className="text-xl text-white/90 mb-10">
            Manage your listings, track bookings, and connect with renters.
          </p>
          <Card className="gradient-card p-6 max-w-2xl mx-auto shadow-2xl border-0">
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="link" size="lg" className="h-12 px-8 flex-1" onClick={handleAddListing}>
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Listing
              </Button>
              <Button variant="link" size="lg" className="h-12 px-8 flex-1" onClick={handleViewListings}>
                <ClipboardList className="h-5 w-5 mr-2" />
                View My Listings
              </Button>
            </div>
          </Card>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { name: "Bookings", emoji: "📅" },
              { name: "Messages", emoji: "💬" },
              { name: "Reviews", emoji: "⭐" },
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