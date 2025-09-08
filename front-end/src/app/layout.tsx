import type { Metadata } from "next";
import type React from "react";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HideOnAdmin from "@/components/layout/HideOnAdmin";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetStore",
  description: "PetStore App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="flex min-h-screen flex-col">
          <HideOnAdmin>
            <Navbar />
          </HideOnAdmin>
          <main className="flex-1">{children}</main>
          <HideOnAdmin>
            <Footer />
          </HideOnAdmin>
        </div>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
