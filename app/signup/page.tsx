"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <>
      <Header />
      <main className="bg-background min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join thousands exploring Italy from home</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-lg">
            <SignUpForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

