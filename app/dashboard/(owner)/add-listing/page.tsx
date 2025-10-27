'use client';

import { useState, useEffect } from "react";
import FormPostingItems from "@/components/items/form-posting-items";
import { useRouter } from "next/navigation";

export default function AddListingPage() {
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
        <div >
            <FormPostingItems />
        </div>
    );
}