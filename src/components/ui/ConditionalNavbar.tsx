"use client"
import { usePathname } from "next/navigation"
import Navbar from "./navbar"

export default function ConditionalNavbar() {
  const pathname = usePathname()
  if (pathname.startsWith("/ai-website-builder")) return null
  return <Navbar />
}
