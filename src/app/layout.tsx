import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShopBuddy',
  description: 'Your Gateway to Shopping Delight',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className='p-4 m-auto min-w-[300px] max-w-7xl'>
          {children}
        </main>
      </body>
    </html>
  )
}
