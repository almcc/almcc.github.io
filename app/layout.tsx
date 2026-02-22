import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | almcc.me",
    default: "almcc.me",
  },
  description: "Personal site of Alastair McClelland",
  metadataBase: new URL("https://almcc.me"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-200">
          <nav className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-6">
            <Link href="/" className="font-semibold text-lg hover:text-gray-600">
              almcc.me
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">
              Blog
            </Link>
            <Link href="/project" className="text-gray-600 hover:text-gray-900">
              Projects
            </Link>
          </nav>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">{children}</main>
        <footer className="border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Alastair McClelland
          </div>
        </footer>
      </body>
    </html>
  );
}
