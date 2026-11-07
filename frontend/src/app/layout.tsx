import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { ViewTransition } from "react";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display", display: "swap" });

export const metadata: Metadata = {
  title: "Ink & Ideas — Stories worth sharing",
  description: "Discover thoughtful writing and share your ideas with the world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
    <body>
      <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('ink-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}` }} />
      <Providers><Navbar /><ViewTransition default="none" enter="route-enter" exit="route-exit"><div className="route-transition">{children}</div></ViewTransition></Providers>
    </body>
  </html>;
}
