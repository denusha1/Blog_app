import type { Metadata } from "next";
import Script from "next/script";
import { ViewTransition } from "react";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import "./globals.css";


export const metadata: Metadata = {
  title: "Ink & Ideas — Stories worth sharing",
  description: "Discover thoughtful writing and share your ideas with the world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning>
    <body>
      <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('ink-theme')||'dark';document.documentElement.dataset.theme=t}catch(e){}` }} />
      <Providers><Navbar /><ViewTransition default="none" enter="route-enter" exit="route-exit"><div className="route-transition">{children}</div></ViewTransition></Providers>
    </body>
  </html>;
}
