'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, User, Plus, Heart, Package, LogOut, LayoutDashboard, Calendar } from "lucide-react"
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
  const [userName, setUserName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const name = typeof window !== "undefined" ? localStorage.getItem("name") : null;
      
      setIsAuthenticated(!!token);
      setUserName(name || "User");
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

  
  const handleLogout = async () => {
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
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
      router.push("/");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rent Marketplace
          </span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-600 transition-colors" />
            <Input
              placeholder="Search for items to rent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-11 rounded-full border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Host Button */}
              <Link href="/dashboard/add-listing">
                <Button 
                  size="sm" 
                  className={`${role == 'owner' ? "md:flex hidden" : "hidden" } bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all `}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List an Item
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-200 transition-all"
                  >
                    <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
                      {getInitials(userName)}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">Manage your account</p>
                  </div>
                  
                  <DropdownMenuItem className="cursor-pointer py-3">
                    <Link href="/dashboard" className="w-full flex items-center gap-3">
                      <LayoutDashboard className="h-4 w-4 text-blue-600" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-3">
                    <Link href="/bookings" className="w-full flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer py-3 text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-blue-50 rounded-full"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}