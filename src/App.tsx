import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./Dashboard";
import { ExampleShowcase } from "./ExampleShowcase";
import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { Analytics } from '@vercel/analytics/react';
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm h-14 sm:h-16 flex justify-between items-center border-b shadow-sm px-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-bold text-primary truncate">OOTD Collage</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Footer />
      <Toaster />
      <Analytics />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-0">
      <Authenticated>
        <Dashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="relative">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-12 sm:py-16 mb-8 sm:mb-12">
            <div className="absolute inset-0 bg-white/50"></div>
            <div className="relative z-10 text-center px-4 sm:px-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Transform Your Outfit Photos Into
                <span className="text-primary block mt-2">Stunning Fashion Collages</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
                Upload any outfit photo and watch our AI create a beautifully styled mood board with all your pieces labeled and perfectly arranged
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Get Started - It's Free ✨
              </button>
              <p className="text-sm text-gray-500 mt-4">No credit card required • Takes 30 seconds</p>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-12">
            <ExampleShowcase
              onGetStarted={() => setIsAuthModalOpen(true)}
            />
          </div>

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </Unauthenticated>
    </div>
  );
}
