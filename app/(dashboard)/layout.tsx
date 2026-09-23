import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FirstAccessModal } from "@/components/auth/FirstAccessModal";
import SubscriptionAlertBanner from "@/components/subscription/SubscriptionAlertBanner";
import SubscriptionExpiredModal from "@/components/subscription/SubscriptionExpiredModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Mandatory First Access 2FA & Password Change Modal */}
      <FirstAccessModal />

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
