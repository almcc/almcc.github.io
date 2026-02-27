import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import PostHogProvider from "./PostHogProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | almcc.me",
    default: "Father, Husband and Software Engineer.",
  },
  description: "Personal site of Alastair McClelland",
  metadataBase: new URL("https://almcc.me"),
  icons: {
    icon: "/al.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <PostHogProvider />
        <header className="border-b border-gray-200">
          <nav className="max-w-3xl mx-auto px-4 py-4 flex items-center">
            <Link href="/" className="flex items-center gap-3 font-semibold text-lg hover:text-gray-600">
              <Image src="/al.png" alt="Alastair McClelland" width={26} height={26} className="rounded-full" />
              almcc.me
            </Link>
            <div className="ml-auto flex items-center gap-6">
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Blog
              </Link>
              <Link href="/project" className="text-gray-600 hover:text-gray-900">
                Projects
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">{children}</main>
        <footer className="border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-gray-500 flex items-center">
            <span>&copy; {new Date().getFullYear()} Alastair McClelland</span>
            <a
              href="https://www.linkedin.com/in/alastair-mcclelland/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-gray-400 hover:text-gray-600"
              aria-label="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
