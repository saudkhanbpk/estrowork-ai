"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/lib/store";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { token } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!token) {
            const currentUrl = `${pathname}?${searchParams.toString()}`;
            router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
        }
    }, [token, router, pathname, searchParams]);

    if (!token) {
        return null;
    }

    return <>{children}</>;
}
