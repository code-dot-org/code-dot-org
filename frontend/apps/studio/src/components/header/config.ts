import type {
  CreateMenuItem,
  GlobalNavItem,
  MenuItem,
  UserType,
} from '@code-dot-org/component-library/header';

import AppLabIcon from '@/config/brand/assets/courses/app-lab-icon.webp';
import ArtistIcon from '@/config/brand/assets/courses/artist-icon.webp';
import DanceIcon from '@/config/brand/assets/courses/dance-party-icon.webp';
import GameLabIcon from '@/config/brand/assets/courses/game-lab-icon.webp';
import AllProjectsIcon from '@/config/brand/assets/courses/header-all-projects-icon.webp';
import MusicDanceAiIcon from '@/config/brand/assets/courses/music-dance-ai-icon.webp';
import MusicLabIcon from '@/config/brand/assets/courses/music-lab-icon.webp';
import PythonLabIcon from '@/config/brand/assets/courses/python-lab-icon.webp';
import SpriteLabIcon from '@/config/brand/assets/courses/sprite-lab-icon.webp';
import WebLab2Icon from '@/config/brand/assets/courses/weblab2-icon.webp';
import CodeAILogo from '@/config/brand/assets/logo-codeai-inverse.svg';

export const BRAND_NAME = 'CodeAI';
export const LOGO_IMAGE_URL = CodeAILogo;

export const STUDENT_MENU_ITEMS: MenuItem[] = [
  {label: 'My Dashboard', href: '/home'},
  {label: 'Course Catalog', href: '//code.org/students'},
  {label: 'Projects', href: '/projects'},
  // Also a global-nav entry; shown on the bar, drawn from the global nav in the hamburger.
  {label: 'Incubator', href: '//code.org/incubator', hideInHamburger: true},
];

export const TEACHER_MENU_ITEMS: MenuItem[] = [
  {label: 'My Dashboard', href: '/home'},
  {label: 'Course Catalog', href: '/catalog'},
  {label: 'Projects', href: '/projects'},
  {label: 'Professional Learning', href: '/my-professional-learning'},
  // Also a global-nav entry; shown on the bar, drawn from the global nav in the hamburger.
  {label: 'Incubator', href: '//code.org/incubator', hideInHamburger: true},
];

export const CREATE_MENU_ITEMS: CreateMenuItem[] = [
  {
    id: 'music_dance_ai',
    label: 'Mix & Move with AI',
    href: '//code.org/mix-move-ai',
    iconUrl: MusicDanceAiIcon,
  },
  {
    id: 'spritelab',
    label: 'Sprite Lab',
    href: '/projects/spritelab/new',
    iconUrl: SpriteLabIcon,
  },
  {
    id: 'applab',
    label: 'App Lab',
    href: '/projects/applab/new',
    iconUrl: AppLabIcon,
  },
  {
    id: 'gamelab',
    label: 'Game Lab',
    href: '/projects/gamelab/new',
    iconUrl: GameLabIcon,
  },
  {
    id: 'weblab2',
    label: 'Web Lab (New)',
    href: '/projects/weblab2/new',
    iconUrl: WebLab2Icon,
  },
  {
    id: 'music',
    label: 'Music Lab',
    href: '/projects/music/new',
    iconUrl: MusicLabIcon,
  },
  {
    id: 'pythonlab',
    label: 'Python Lab',
    href: '/projects/pythonlab/new',
    iconUrl: PythonLabIcon,
  },
  {
    id: 'artist',
    label: 'Artist',
    href: '/projects/artist/new',
    iconUrl: ArtistIcon,
  },
  {
    id: 'dance',
    label: 'Dance',
    href: '/projects/dance/new',
    iconUrl: DanceIcon,
  },
  {
    id: 'view_all',
    label: 'View all projects...',
    href: '/projects',
    iconUrl: AllProjectsIcon,
  },
];

export const GLOBAL_NAV: GlobalNavItem[] = [
  {label: 'Learn', href: '//code.org/students'},
  {
    label: 'Teach',
    subItems: [
      {label: 'Educator Overview', href: '//code.org/teach'},
      {
        label: 'Elementary School',
        href: '//code.org/educate/curriculum/elementary-school',
      },
      {
        label: 'Middle School',
        href: '//code.org/educate/curriculum/middle-school',
      },
      {label: 'High School', href: '//code.org/educate/curriculum/high-school'},
      {label: 'Hour of Code', href: 'https://hourofcode.com'},
      {
        label: 'Beyond Code.org',
        href: '//code.org/educate/curriculum/3rd-party',
      },
      {label: 'Online Community', href: 'https://forum.code.org/'},
      {label: 'Technical Requirements', href: '//code.org/educate/it'},
      {label: 'Tools and Videos', href: '//code.org/educate/resources/videos'},
    ],
  },
  {label: 'Districts', href: '//code.org/administrators'},
  {label: 'Stats', href: '//code.org/promote'},
  {label: 'Donate', href: '//code.org/donate'},
  {label: 'Incubator', href: '//code.org/incubator'},
  {
    label: 'About',
    subItems: [
      {label: 'About Us', href: '//code.org/about'},
      {label: 'Leadership', href: '//code.org/about/leadership'},
      {label: 'Donors', href: '//code.org/about/donors'},
      {label: 'Partners', href: '//code.org/about/partners'},
      {label: 'Full Team', href: '//code.org/about/team'},
      {label: 'Newsroom', href: '//code.org/about/news'},
      {label: 'Careers', href: '//code.org/about/jobs'},
      {label: 'Contact Us', href: '//code.org/contact'},
      {label: 'FAQs', href: '//code.org/faq'},
    ],
  },
  // Legal lives in the hamburger drawer only (matches the legacy header's "Legal"
  // expander); the top bar never shows it.
  {
    label: 'Privacy & Legal',
    hamburgerOnly: true,
    subItems: [
      {label: 'Privacy Policy', href: '//code.org/privacy'},
      {label: 'Cookie Notice', href: '//code.org/cookies'},
      {label: 'Terms of Service', href: '//code.org/terms-of-service'},
    ],
  },
];

/** Help/support links; teachers additionally get the forum. All open in a new tab. */
export function buildSupportLinks(userType?: UserType): MenuItem[] {
  return [
    {label: 'Help and support', href: 'https://support.code.org'},
    {
      label: 'Report a problem',
      href: 'https://support.code.org/hc/en-us/requests/new',
    },
    ...(userType === 'teacher'
      ? [{label: 'Teacher forum', href: 'https://forum.code.org'}]
      : []),
  ];
}
