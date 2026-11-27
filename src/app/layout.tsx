import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansMyanmar = Noto_Sans_Myanmar({
  variable: "--font-noto-myanmar",
  subsets: ["myanmar", "latin"],
});

export const metadata: Metadata = {
  title: "အွန်လိုင်းဆိုင် ဘောက်ချာ | Social Shop Voucher",
  description:
    "Fast single-use order voucher generator for Myanmar social commerce sellers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="my"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansMyanmar.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F3F4F6] text-foreground font-sans antialiased selection:bg-stone-200 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
