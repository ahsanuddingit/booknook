import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { AppToaster } from "@/components/app-toaster";
import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BookNook — A cozy corner for readers",
    template: "%s · BookNook",
  },
  description:
    "Discover, share, and borrow books with BookNook — your neighborhood library in the cloud.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-ink">
        <AuthProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
