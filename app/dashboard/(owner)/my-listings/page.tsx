"use client";

import { useEffect, useState } from "react";
import ViewEditDeleteListing from "@/components/items/view-edit-delete-listing";
import { useRouter } from "next/navigation";



export default function MyListingPage() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role");
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    if (role && role !== "owner") {
      router.push("/dashboard");
    }
  }, [role, router]);

  if (role !== "owner") {
    return null;
  }

  
  return (
    <div>
      <ViewEditDeleteListing />
    </div>
  ); 
}