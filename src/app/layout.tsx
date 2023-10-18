import './globals.css'
import type { Metadata } from 'next'
import Head from 'next/head';
import { Inter } from 'next/font/google'
import FluentProviderClient from './FluentProvider';
import AppFooter from "@/app/partials/Footer";
import AppHeader from "@/app/partials/Header";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FluentDash',
  description: 'Making it easier to `Fluent`',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

    <Head>
      <meta charSet="UTF-8" />
      <link rel="icon" href="/assets/d.png" type="image/png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

      <body className={inter.className}>
        <div className="appContainer">
          <FluentProviderClient>
            <AppHeader />
              {children}
            <AppFooter />
          </FluentProviderClient>
        </div>
      </body>
    </html>
  )
}
