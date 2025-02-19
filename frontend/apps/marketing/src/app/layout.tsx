import type {Metadata} from 'next';

import '@code-dot-org/component-library-styles/font-awesome.scss';
import '@code-dot-org/component-library-styles/colors.scss';

import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
