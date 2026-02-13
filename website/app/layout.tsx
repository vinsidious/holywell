import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';

import { Nav } from './components/nav';
import { Footer } from './components/footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://holywell.sh'),
  title: 'holywell — SQL Formatter',
  description:
    'Zero-config SQL formatter with river alignment. Format SQL in your browser.',
  openGraph: {
    title: 'holywell — SQL Formatter',
    description:
      'Zero-config SQL formatter with river alignment. Format SQL in your browser.',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'holywell — Zero-config SQL formatter with river alignment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'holywell — SQL Formatter',
    description:
      'Zero-config SQL formatter with river alignment. Format SQL in your browser.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
