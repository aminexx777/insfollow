"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  TwitterIcon as TikTok,
  Star,
  Shield,
  Zap,
} from "lucide-react"
import { Logo } from "@/components/logo"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      // If logged in, redirect to dashboard
      router.push("/dashboard")
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent animate-fadeIn">
                Boost Your Social Media Presence
              </h1>
              <p className="text-xl text-muted-foreground mb-8 animate-slideUp">
                Get high-quality followers, likes, and engagement for your social media accounts with InsFollow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp">
                <Button size="lg" asChild>
                  <Link href="/services">
                    Explore Services <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              <img src="/hero-image.png" alt="Social Media Growth" className="w-full h-auto rounded-lg shadow-2xl" />
            </motion.div>
          </div>
        </div>

        {/* Floating social icons */}
        <div className="hidden md:block">
          <div className="absolute top-1/4 left-10 animate-bounce duration-1000">
            <Instagram className="h-12 w-12 text-pink-500 opacity-20" />
          </div>
          <div className="absolute top-2/3 left-1/4 animate-bounce duration-2000 delay-300">
            <Twitter className="h-8 w-8 text-blue-400 opacity-20" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-bounce duration-2000 delay-700">
            <Facebook className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
          <div className="absolute top-1/2 right-20 animate-bounce duration-1000 delay-500">
            <Youtube className="h-12 w-12 text-red-500 opacity-20" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-bounce duration-1500 delay-200">
            <TikTok className="h-10 w-10 text-black dark:text-white opacity-20" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer a wide range of social media services to help you grow your online presence and engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Instagram className="h-8 w-8 text-pink-500" />,
                title: "Instagram",
                description: "Followers, likes, comments, and more for your Instagram account.",
              },
              {
                icon: <Twitter className="h-8 w-8 text-blue-400" />,
                title: "Twitter",
                description: "Followers, retweets, and likes to boost your Twitter presence.",
              },
              {
                icon: <Facebook className="h-8 w-8 text-blue-600" />,
                title: "Facebook",
                description: "Page likes, followers, and post engagement for Facebook.",
              },
              {
                icon: <Youtube className="h-8 w-8 text-red-500" />,
                title: "YouTube",
                description: "Subscribers, views, likes, and comments for your YouTube channel.",
              },
              {
                icon: <TikTok className="h-8 w-8" />,
                title: "TikTok",
                description: "Followers, likes, and views to make your TikTok content go viral.",
              },
              {
                icon: <Star className="h-8 w-8 text-yellow-500" />,
                title: "And More",
                description: "Services for other platforms including Twitch, Spotify, and more.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 card-hover"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose InsFollow</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide high-quality services with fast delivery and excellent customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-10 w-10 text-yellow-500" />,
                title: "Fast Delivery",
                description:
                  "Our services are delivered quickly and efficiently to help you grow your social media presence.",
              },
              {
                icon: <Shield className="h-10 w-10 text-green-500" />,
                title: "Safe & Secure",
                description:
                  "We use secure methods to ensure your accounts are safe and your information is protected.",
              },
              {
                icon: <Star className="h-10 w-10 text-blue-500" />,
                title: "High Quality",
                description: "We provide high-quality services that help you achieve real engagement and growth.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 card-hover"
              >
                <div className="inline-flex items-center justify-center p-3 bg-muted rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Social Media?</h2>
            <p className="text-muted-foreground mb-8">
              Create an account today and start growing your social media presence with our premium services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="small" className="mb-4" />
              <p className="text-muted-foreground">Boost your social media presence with our premium services.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                    YouTube
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                    TikTok
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors">
                    My Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} InsFollow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
