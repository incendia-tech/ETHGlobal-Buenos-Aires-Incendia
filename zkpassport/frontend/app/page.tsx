"use client"

import Link from "next/link"
import { Flame, Shield, Lock, Zap, ArrowRight, CheckCircle2, Sparkles, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-all duration-300 group-hover:scale-105">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Incendia
              </h1>
            </Link>
            <Link href="/auctions">
              <Button variant="outline" className="gap-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 transition-all">
                View Auctions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center max-w-5xl mx-auto relative">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-8 border border-orange-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-1 rounded-full bg-orange-500">
                <Flame className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-orange-900">ZKPassport • Private Bidding • Proof-of-Burn</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Private Bidding with
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                ZKPassport
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto font-light">
              Experience truly <strong className="text-gray-900">private bidding</strong> powered by <strong className="text-orange-600">ZKPassport</strong> zero-knowledge verification. 
              Your identity stays private, your bids remain completely secret until reveal, 
              and everything is secured on-chain.
            </p>

            {/* Key Features Highlight */}

            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auctions">
                <Button 
                  size="lg" 
                  className="gap-2 text-lg px-10 py-7 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 border-0"
                >
                  Explore Auctions
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-7 border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 bg-white/60 backdrop-blur-sm">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Why Choose Incendia?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for Privacy & Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built on cutting-edge zero-knowledge technology for maximum privacy and security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Feature 1 */}
            <div className="group bg-white p-10 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ZKPassport Verification</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                <strong className="text-gray-900">ZKPassport</strong> enables private identity verification using zero-knowledge proofs. 
                Your personal information stays completely private while proving you meet auction requirements—no data leaks, no compromises.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-10 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Private Bidding</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                <strong className="text-gray-900">Private bidding</strong> ensures your bids remain completely secret until the auction closes. 
                No one can see your bid amount—not even the auction organizers—ensuring truly fair competition.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-10 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proof-of-Burn</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Participate by burning tokens as proof of commitment. This creates a 
                verifiable, on-chain record of your participation.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple & Secure Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple steps to participate in secure, private auctions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Register",
                description: "Verify your identity with ZKPassport to register for the auction",
                icon: Users,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "2",
                title: "Burn Tokens",
                description: "Burn tokens as proof of participation and commitment",
                icon: Flame,
                color: "from-orange-500 to-red-500"
              },
              {
                step: "3",
                title: "Submit Bid",
                description: "Submit your sealed bid with zero-knowledge proof verification",
                icon: Lock,
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "4",
                title: "Reveal",
                description: "Wait for auction to close and results to be revealed on-chain",
                icon: Eye,
                color: "from-green-500 to-green-600"
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {item.step}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-md">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 bg-gradient-to-br from-gray-50 to-orange-50/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Key Benefits</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why You'll Love It
              </h2>
            </div>

            <div className="space-y-6">
              {[
                "Complete privacy - your identity and bids remain confidential",
                "On-chain verification - all proofs are verifiable on the blockchain",
                "Fair competition - sealed bids prevent bid manipulation",
                "Secure registration - ZKPassport ensures only eligible participants",
                "Transparent results - final outcomes are publicly verifiable"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-gray-700 text-xl leading-relaxed pt-1">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to Get Started?</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Ready to Participate?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-orange-50 max-w-3xl mx-auto leading-relaxed">
                Browse active auctions and start <strong>private bidding</strong> with <strong>ZKPassport</strong> verification—complete privacy and security guaranteed
              </p>
              <Link href="/auctions">
                <Button 
                  size="lg" 
                  className="gap-3 text-lg px-10 py-7 bg-white text-orange-600 hover:bg-orange-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
                >
                  View All Auctions
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Incendia</span>
            </div>
            <p className="text-sm text-gray-500 text-center md:text-right">
              © 2024 Incendia. Built for ETHGlobal Buenos Aires.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
