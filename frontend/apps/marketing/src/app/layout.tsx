import type { Metadata } from 'next';
import './globals.css';
import classNames from 'classnames';
import { FONT_VARIABLES } from '@/config/fonts'

export const metadata: Metadata = {
  title: 'Code.org',
  description: 'Anyone can learn!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={classNames(FONT_VARIABLES)}>
      <body>{children}</body>
    </html>
  );
}
