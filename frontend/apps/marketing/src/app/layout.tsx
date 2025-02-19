import type {Metadata} from 'next';

import './globals.css';
import '@code-dot-org/component-library-styles/font-awesome.scss';
import '@code-dot-org/component-library-styles/colors.scss';
import Header from '@/components/header';

export const metadata: Metadata = {
  title: 'Code.org',
  description: 'Anyone can learn!',
};

const LOGGED_OUT_LINKS = [
  { text: 'Learn', href: '/students' },
  { text: 'Teach', href: '/teach' },
  { text: 'Districts', href: '/administrators' },
]

const LOGGED_IN_LINKS = [
  { text: 'My Dashboard', href: '/home' },
  { text: 'Course Catalog', href: '/catalog' },
  { text: 'Projects', href: '/projects' },
  { text: 'Professional Learning', href: '/my-professional-learning' },
  { text: 'Incubator', href: '/incubator' },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><Header links={LOGGED_IN_LINKS} />{children}</body>
    </html>
  );
}
