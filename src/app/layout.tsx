import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TanstackProvider } from "@/providers/tanstack-provider";
import { ThemeProvider } from "@/providers/theme-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Zapobiega zoomowaniu formularzy na iOS
};

export const metadata: Metadata = {
  title: "LSO Manager",
  description: "System zarządzania służbą liturgiczną",
  manifest: "/manifest.json", // Link do manifestu, który wygenerowaliśmy
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LSO Manager",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TanstackProvider>
            {children}
          </TanstackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}