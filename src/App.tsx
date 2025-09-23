import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./Dashboard";
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm min-h-[3.5rem] flex justify-between items-center border-b shadow-sm px-3 sm:px-4 sm:h-16">
        <h2 className="text-lg sm:text-xl font-semibold text-primary truncate">OOTD Collage</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-3 sm:p-4">
        <Content />
      </main>
      <Toaster />
      <Analytics />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

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
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 sm:gap-8 px-2 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">OOTD Collage</h1>
            <p className="text-lg sm:text-xl text-secondary mb-6 sm:mb-8 px-4 sm:px-0">
              Create beautiful fashion mood boards from your outfit photos
            </p>
          </div>
          <div className="w-full max-w-md px-2 sm:px-0">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
