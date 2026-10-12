import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JDIH BIN — Jaringan Dokumentasi dan Informasi Hukum",
  description:
    "Portal Jaringan Dokumentasi dan Informasi Hukum Badan Intelijen Negara. Akses produk hukum, peraturan, dan informasi resmi.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d3b73" },
    { media: "(prefers-color-scheme: dark)", color: "#0a111f" },
  ],
};

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('jdih-theme');
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && systemDark) || (stored === 'system' && systemDark)) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`bg-background text-foreground ${inter.variable} ${poppins.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased flex min-h-screen flex-col bg-background text-foreground">
        <QueryProvider>
          <ThemeProvider>
            <div className="flex-1">{children}</div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

