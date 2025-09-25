"use client"

import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Lock, 
  Target, 
  CheckCircle, 
  Smartphone,
  PiggyBank,
  Globe,
  Monitor,
  DollarSign,
  Eye,
  Heart,
  Zap,
  Plus,
  UserPlus,
  Moon,
  Sun
} from "lucide-react"

export default function Home() {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Refs for intersection observer
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const previewRef = useRef(null)
  const whyChooseRef = useRef(null)
  const faqRef = useRef(null)
  
  // Intersection observers
  const heroInView = useInView(heroRef, { once: true })
  const featuresInView = useInView(featuresRef, { once: true })
  const previewInView = useInView(previewRef, { once: true })
  const whyChooseInView = useInView(whyChooseRef, { once: true })
  const faqInView = useInView(faqRef, { once: true })

  // Parallax for background blobs
  const { scrollYProgress } = useScroll()
  // Horizontal parallax based on scroll progress (0 → 1)
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 0])
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 0])
  const blob3Y = useTransform(scrollYProgress, [0, 1], [0, 0])
  const blob1X = useTransform(scrollYProgress, [0, 1], [-120, 120])
  const blob2X = useTransform(scrollYProgress, [0, 1], [100, -100])
  const blob3X = useTransform(scrollYProgress, [0, 1], [-60, 60])

  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xeatiyqxxoqgzvlbcscp') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  // Handle theme mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Fixed background blobs and grid across the whole landing page (with parallax) */}
      <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div style={{ y: blob1Y, x: blob1X }} className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-emerald-400/15 dark:bg-emerald-500/15 blur-3xl will-change-transform" />
        <motion.div style={{ y: blob2Y, x: blob2X }} className="absolute top-1/3 -right-48 h-[600px] w-[600px] rounded-full bg-teal-400/12 dark:bg-teal-500/12 blur-3xl will-change-transform" />
        <motion.div style={{ y: blob3Y, x: blob3X }} className="absolute bottom-[-120px] left-1/4 h-[520px] w-[520px] rounded-full bg-lime-400/12 dark:bg-lime-500/12 blur-3xl will-change-transform" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.10)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:opacity-20 animate-grid-pan" />
      </div>

      {/* content wrapper above background */}
      <div className="relative z-10">
      {/* Sticky Navigation */}
      <div className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 justify-center w-full sm:justify-start sm:w-auto">
            <Image
              src="/Applogo.png"
              alt="Expensio Tracker Logo"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300">
            <a href="#features" className="hover:text-emerald-700">Features</a>
            <a href="#how" className="hover:text-emerald-700">How it works</a>
            <a href="#screens" className="hover:text-emerald-700">Screenshots</a>
            
            <a href="#faq" className="hover:text-emerald-700">FAQ</a>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="h-9 w-9 rounded-lg hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>
            
            <Link href="/login" className="inline-flex items-center rounded-lg border border-emerald-300/70 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-2 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 transition">Sign In</Link>
            <Link href="/signup" className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm px-4 py-2 hover:from-emerald-700 hover:to-teal-700 transition">Get Started</Link>
          </div>
        </div>
      </div>
      {/* Removed extra section pattern layer */}

      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        initial="initial"
        animate={heroInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-14 md:py-16 lg:py-20 overflow-hidden"
      >
        {/* Background visuals are now global & fixed */}
        <div className="max-w-5xl mx-auto text-center">
          
          <motion.h1 
            variants={fadeInUp}
            className="mx-auto max-w-4xl heading-display mb-8 leading-tight"
          >
            <span className="text-gray-900 dark:text-emerald-200">Take control</span> of
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent"> your finances</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Monitor your spending, analyze trends, and achieve your financial goals with our intuitive expense tracking platform.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <Button asChild size="lg" className="text-base sm:text-lg lg:text-xl px-8 py-4 sm:px-10 sm:py-6 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base sm:text-lg lg:text-xl px-8 py-4 sm:px-10 sm:py-6 hover:scale-105 transition-all duration-200 border-2 border-emerald-300 text-emerald-700 dark:text-emerald-300">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </motion.div>

          {/* Security badges row under CTAs */}
          <motion.div
            variants={scaleIn}
            className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200/60 dark:border-emerald-800/40 rounded-full text-sm font-medium"
          >
            <Lock className="h-4 w-4 text-emerald-600" />
            <span className="text-gray-700 dark:text-gray-300">End-to-end Encrypted</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-gray-700 dark:text-gray-300">Secure & Private</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Globe className="h-4 w-4 text-emerald-600" />
            <span className="text-gray-700 dark:text-gray-300">GDPR Compliant</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        ref={featuresRef}
        initial="initial"
        animate={featuresInView ? "animate" : "initial"}
        variants={staggerContainer}
        id="features"
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-14 md:py-16 lg:py-20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight mb-8">
              Everything you need to manage your finances
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Powerful features designed to help you track expenses, set goals, and build better financial habits.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div variants={fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-fit mx-auto mb-6">
                    <BarChart3 className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Analytics</CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Get insights into your spending patterns with beautiful charts and detailed reports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Category breakdowns</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Zap className="h-5 w-5 text-green-600" />
                      </div>
                      <span>Spending trends</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Eye className="h-5 w-5 text-purple-600" />
                      </div>
                      <span>Monthly comparisons</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white w-fit mx-auto mb-6">
                    <Shield className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Secure & Private</CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your financial data is encrypted and secure. We never share your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Lock className="h-5 w-5 text-green-600" />
                      </div>
                      <span>End-to-end encryption</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Privacy-first design</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      </div>
                      <span>GDPR compliant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white w-fit mx-auto mb-6">
                    <Target className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Savings Goals</CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Set and track your financial goals with progress bars and achievement badges.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <span>Custom goal setting</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Zap className="h-5 w-5 text-green-600" />
                      </div>
                      <span>Progress tracking</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <Heart className="h-5 w-5 text-yellow-600" />
                      </div>
                      <span>Achievement rewards</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* How it works Section */}
      <section id="how" className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-14 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-900 dark:text-emerald-200 mb-4 leading-tight">How it works</h2>
            <p className="text-gray-600 dark:text-gray-300">Three steps to get insights and save more.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* connecting line */}
            <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200" />
            <div className="group rounded-2xl bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 p-6 relative transition-all">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 pointer-events-none transition-opacity" />
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-semibold"><UserPlus className="h-5 w-5" /></div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Create your account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Sign up free and set currency and categories.</p>
            </div>
            <div className="group rounded-2xl bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 p-6 relative transition-all">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 pointer-events-none transition-opacity" />
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-semibold"><Plus className="h-5 w-5" /></div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Add transactions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Import or add manually. We auto‑categorize.</p>
            </div>
            <div className="group rounded-2xl bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 p-6 relative transition-all">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 pointer-events-none transition-opacity" />
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-semibold"><PiggyBank className="h-5 w-5" /></div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Track & save</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Dashboards, goals, and insights help you save.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview / Screens Section */}
      <motion.div 
        ref={previewRef}
        initial="initial"
        animate={previewInView ? "animate" : "initial"}
        variants={staggerContainer}
        id="screens"
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight mb-8">
              See it in action
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Beautiful, intuitive interfaces that make managing your finances a pleasure.
            </p>
          </motion.div>

          {/* Static grid of mockups (no carousel, no shadows) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <motion.div variants={fadeInUp} className="relative">
              <div className="relative mx-auto max-w-2xl">
                <Image
                  src="/Laptop Mockup.png"
                  alt="Dashboard laptop mockup"
                  width={1600}
                  height={1000}
                  className="w-full h-auto rounded-2xl"
                />
              </div>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">Dashboard</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="relative mx-auto max-w-md">
                <Image
                  src="/Tablet Mockup.png"
                  alt="Transactions tablet mockup"
                  width={1200}
                  height={900}
                  className="w-full h-auto rounded-2xl"
                />
              </div>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">Transactions</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="relative mx-auto max-w-[260px]">
                <Image
                  src="/Mobile Mockup.png"
                  alt="Savings mobile mockup"
                  width={600}
                  height={1200}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">Savings Goals</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Why Choose Us Section with background */}
      <motion.div 
        ref={whyChooseRef}
        initial="initial"
        animate={whyChooseInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-14 md:py-16 lg:py-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight mb-8">Why Users Love Expensio</h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Built specifically for personal finance management with your needs in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div variants={fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardContent className="p-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-fit mx-auto mb-6">
                    <Monitor className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Simple & Intuitive Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Clean, modern interface designed for ease of use. No complicated menus or confusing options.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardContent className="p-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white w-fit mx-auto mb-6">
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Works on All Devices</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Responsive design that works perfectly on desktop, tablet, and mobile devices.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardContent className="p-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white w-fit mx-auto mb-6">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Built for Personal Finance</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Features specifically designed for personal expense tracking and financial goal setting.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardContent className="p-8">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white w-fit mx-auto mb-6">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Free Forever, No Hidden Costs</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Core features are completely free with no subscriptions, hidden fees, or premium paywalls.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Testimonials removed */}
        </div>
      </motion.div>

      

      {/* FAQ Section with background */}
      <motion.div 
        ref={faqRef}
        initial="initial"
        animate={faqInView ? "animate" : "initial"}
        variants={staggerContainer}
        id="faq"
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight mb-8">
              Frequently Asked Questions
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Everything you need to know about our expense tracking platform
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Accordion type="single" collapsible className="space-y-6">
              <AccordionItem value="item-1" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4">
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  Is my financial data secure?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-4 text-lg leading-relaxed">
                  Yes, absolutely. We use bank-level encryption to protect your data. Your information is never shared with third parties, and we follow strict privacy protocols.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4">
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  Can I use this app for free?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-4 text-lg leading-relaxed">
                  Yes! Our basic features are completely free forever. We offer premium features for advanced analytics and goal tracking, but the core expense tracking functionality is always free.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4">
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  Can I sync data across multiple devices?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-4 text-lg leading-relaxed">
                  Yes, your data syncs automatically across all your devices. Whether you use our web app, mobile app, or both, your information stays in sync.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4">
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  How do I get started?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-4 text-lg leading-relaxed">
                  Simply sign up for a free account, add your first transaction, and start tracking! Our intuitive interface makes it easy to get started in minutes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </motion.div>

      {/* Final CTA Section */}
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight mb-8">
            Ready to take control of your finances?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who have transformed their financial habits with our expense tracking platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="text-base sm:text-lg lg:text-xl px-8 py-4 sm:px-12 sm:py-6 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base sm:text-lg lg:text-xl px-8 py-4 sm:px-12 sm:py-6 hover:scale-105 transition-all duration-200 border-2">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
          
          {!hasRealCredentials && (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl max-w-3xl mx-auto">
              <p className="text-yellow-800 dark:text-yellow-200 leading-relaxed">
                <strong>Demo Mode:</strong> To enable full authentication, please configure your Supabase project.
                See <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-sm font-mono">SUPABASE_SETUP.md</code> for instructions.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-14 border-t border-gray-200/20 dark:border-gray-700/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/Applogo.png"
                alt="Expensio Tracker Logo"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
              />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">— Track. Save. Grow.</div>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Support</Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link href="/signup" className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm px-4 py-2 hover:from-emerald-700 hover:to-teal-700 transition">Get Started Free</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-600 dark:text-gray-400">© 2025 Expensio. All rights reserved.</div>
        </div>
      </footer>
      </div>
    </div>
  )
}
