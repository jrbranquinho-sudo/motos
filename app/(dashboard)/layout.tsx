"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import SubscriptionAlertBanner from "@/components/subscription/SubscriptionAlertBanner";
import SubscriptionExpiredModal from "@/components/subscription/SubscriptionExpiredModal";
import { useMotoShop } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isAuthenticated } = useMotoShop();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoaded, isAuthenticated, router]);

  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-[#0f0f0f] items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Expired Subscription Blocking Overlay */}
      <SubscriptionExpiredModal />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        {/* Warning Banner when <= 15% remaining */}
        <SubscriptionAlertBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
