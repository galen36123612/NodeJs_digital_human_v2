import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

import { Providers } from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "HeyGen Interactive Avatar",
    template: `%s - HeyGen Interactive`,
  },
  icons: {
    icon: "/heygen-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans`}
      lang="en"
    >
      <head />
      <body className={clsx("min-h-[calc(100dvh)] bg-background antialiased overflow-hidden")}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <main className="relative flex flex-col h-[calc(100dvh)] w-screen overflow-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
