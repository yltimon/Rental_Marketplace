"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OwnerLandingPage from "@/components/landingPage/ownerLandingPage";
import RenterLandingPage from "@/components/landingPage/renterLandingPage";
import NoUserLandingPage from "@/components/landingPage/noUserLandingPage";
import ItemsPage from '@/components/items/render-items-on-landingpage';

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Example: get role from localStorage (set this after login/signup)
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!storedRole) {
      router.push("/");
    } else {
      setRole(storedRole);
    }
  }, [router]);


  return (
    <div className="p-8 mt-16">
      {role === "renter" ? (
        <>
          <RenterLandingPage />
          <ItemsPage />
        </>
      ) : role === "owner" ? (
        <OwnerLandingPage />
      ) : (
        <>
            <NoUserLandingPage />
            <ItemsPage />
        </>
        
      )}
    </div>
  );
}