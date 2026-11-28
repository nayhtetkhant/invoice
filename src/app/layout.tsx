import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const pyidaungsu = localFont({
  src: [
    {
      path: "./fonts/Pyidaungsu-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Pyidaungsu-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pyidaungsu",
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoSansMono = Noto_Sans_Mono({
  variable: "--font-noto-mono",
  subsets: ["latin"],
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
      className={`${pyidaungsu.variable} ${notoSans.variable} ${notoSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F3F4F6] text-foreground font-sans antialiased selection:bg-stone-200 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
