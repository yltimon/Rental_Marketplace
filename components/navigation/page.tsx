'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, User, Plus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation"

export function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

   useEffect(() => {
      const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setIsAuthenticated(!!token);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    
    window.addEventListener("authChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
    };
  }, []);

  // Handle logout API call and localStorage cleanup

  const handlelogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");

    window.dispatchEvent(new Event("authChange"));

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsAuthenticated(false);
        window.location.href = "/"; // Redirect to homepage after logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
      router.push("/");
    }
  };
  


  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white">
      <div className=" flex justify-between lg:justify-around text-lg items-center h-16">
        <Link href="/" >
            <span className="font-bold text-xl text-foreground">Rent Marketplace</span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full bg-white rounded-full shadow-sm border border-muted px-2 py-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for items to rent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-11 rounded-full border-none focus:ring-2 focus:ring-primary transition-all bg-transparent text-base"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/host">
                <Button size="sm" className="hidden md:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  Host an item
                </Button>
              </Link>

              <Button variant="ghost" size="icon">
                <Heart className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full">My Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/bookings" className="w-full">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/items" className="w-full">My Items</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlelogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>

            <div className="flex items-center gap-2">
                <Link href="/login">
                    <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/signup">
                    <Button>Sign up</Button>
                </Link>
            </div>
            </>
          )}

          {/* Mobile menu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}