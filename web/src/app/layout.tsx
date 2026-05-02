import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'PodcastStats',
  description: 'Your podcast listening statistics',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 min-h-screen pb-20" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}