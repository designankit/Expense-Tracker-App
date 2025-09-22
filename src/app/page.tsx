"use client"

import { useEffect } from "react"
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
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Lock, 
  Target, 
  CheckCircle, 
  Smartphone,
  CreditCard,
  PiggyBank,
  Globe,
  Monitor,
  DollarSign,
  Eye,
  Heart,
  Zap
} from "lucide-react"

export default function Home() {
  const { user, loading } = useSupabase()
  const router = useRouter()
  
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

  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xeatiyqxxoqgzvlbcscp') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        initial="initial"
        animate={heroInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            variants={scaleIn}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full text-sm font-medium mb-8 shadow-lg"
          >
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-gray-700 dark:text-gray-300">End-to-end Encrypted</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-gray-700 dark:text-gray-300">Secure & Private</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Globe className="h-4 w-4 text-green-600" />
            <span className="text-gray-700 dark:text-gray-300">GDPR Compliant</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8 leading-tight"
          >
            Take control of your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              finances
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Monitor your spending, analyze trends, and achieve your financial goals with our intuitive expense tracking platform.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Button asChild size="lg" className="text-lg px-10 py-6 hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 hover:scale-105 transition-all duration-200 border-2">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        ref={featuresRef}
        initial="initial"
        animate={featuresInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Everything you need to manage your finances
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Powerful features designed to help you track expenses, set goals, and build better financial habits.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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

      {/* Preview Section */}
      <motion.div 
        ref={previewRef}
        initial="initial"
        animate={previewInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gray-50/50 dark:bg-gray-800/30"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              See it in action
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Beautiful, intuitive interfaces that make managing your finances a pleasure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <motion.div variants={fadeInUp} className="relative">
              {/* Laptop Mockup */}
              <div className="relative mx-auto max-w-sm">
                <div className="bg-gray-800 rounded-t-2xl p-2 shadow-2xl">
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold">Dashboard</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">₹50K</div>
                          <div className="text-sm text-green-600/70">Income</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">₹12K</div>
                          <div className="text-sm text-red-600/70">Expenses</div>
                        </div>
                      </div>
                      <div className="h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 h-8 rounded-b-2xl shadow-2xl"></div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              {/* Tablet Mockup */}
              <div className="relative mx-auto max-w-xs">
                <div className="bg-gray-800 rounded-2xl p-2 shadow-2xl">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-base font-semibold">Transactions</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium">Groceries</span>
                          </div>
                          <span className="text-sm font-bold text-red-600">-₹2.5K</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Salary</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">+₹50K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              {/* Phone Mockup */}
              <div className="relative mx-auto max-w-48">
                <div className="bg-gray-800 rounded-3xl p-2 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 flex items-center justify-center">
                      <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-orange-100">
                          <PiggyBank className="h-4 w-4 text-orange-600" />
                        </div>
                        <h3 className="text-sm font-semibold">Savings</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">Emergency</span>
                            <span className="text-xs font-bold text-blue-600">65%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-1">
                            <div className="bg-blue-500 h-1 rounded-full w-3/5"></div>
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">Vacation</span>
                            <span className="text-xs font-bold text-green-600">30%</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-1">
                            <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Why Choose Us Section */}
      <motion.div 
        ref={whyChooseRef}
        initial="initial"
        animate={whyChooseInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Why Choose Us?
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Built specifically for personal finance management with your needs in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
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
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
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
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
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
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
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
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        ref={faqRef}
        initial="initial"
        animate={faqInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gray-50/50 dark:bg-gray-800/30"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Everything you need to know about our expense tracking platform
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Accordion type="single" collapsible className="space-y-6">
              <AccordionItem value="item-1" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg">
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  Is my financial data secure?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-4 text-lg leading-relaxed">
                  Yes, absolutely. We use bank-level encryption to protect your data. Your information is never shared with third parties, and we follow strict privacy protocols.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg">
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  Can I use this app for free?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-4 text-lg leading-relaxed">
                  Yes! Our basic features are completely free forever. We offer premium features for advanced analytics and goal tracking, but the core expense tracking functionality is always free.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg">
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  Can I sync data across multiple devices?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pt-4 text-lg leading-relaxed">
                  Yes, your data syncs automatically across all your devices. Whether you use our web app, mobile app, or both, your information stays in sync.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg">
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
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who have transformed their financial habits with our expense tracking platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button asChild size="lg" className="text-xl px-12 py-8 hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-xl px-12 py-8 hover:scale-105 transition-all duration-200 border-2">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
          
          {!hasRealCredentials && (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl max-w-3xl mx-auto shadow-lg">
              <p className="text-yellow-800 dark:text-yellow-200 leading-relaxed">
                <strong>Demo Mode:</strong> To enable full authentication, please configure your Supabase project.
                See <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-sm font-mono">SUPABASE_SETUP.md</code> for instructions.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-600 dark:text-gray-400">
              © 2024 Expense Tracker. All rights reserved.
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
