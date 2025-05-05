"use client"

import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  circular?: boolean
}

export function Logo({ className, size = "md", circular = true }: LogoProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const logoSrc = "/logo.png"

  // Smaller sizes for better fit
  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  }

  // Add error handling to prevent undefined access
  const dimensions = sizeMap[size as keyof typeof sizeMap] || sizeMap.md
  const { width, height } = dimensions

  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <div
        className={cn(
          "overflow-hidden flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary",
          circular ? "rounded-full" : "rounded-md",
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src={logoSrc || "/placeholder.svg"}
          alt="InsFollow Logo"
          width={width}
          height={height}
          className={cn("object-contain", circular ? "p-1" : "")}
          priority
        />
      </div>
    </Link>
  )
}
