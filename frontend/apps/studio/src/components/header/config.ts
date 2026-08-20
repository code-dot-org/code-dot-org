import type {
  CreateMenuItem,
  GlobalNavItem,
  MenuItem,
  UserType,
} from '@code-dot-org/component-library/header';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';

import AppLabIcon from '@/config/brand/assets/courses/app-lab-icon.webp';
import DanceIcon from '@/config/brand/assets/courses/dance-party-icon.webp';
import GameLabIcon from '@/config/brand/assets/courses/game-lab-icon.webp';
import AllProjectsIcon from '@/config/brand/assets/courses/header-all-projects-icon.webp';
import MusicDanceAiIcon from '@/config/brand/assets/courses/music-dance-ai-icon.webp';
import MusicLabIcon from '@/config/brand/assets/courses/music-lab-icon.webp';
import PythonLabIcon from '@/config/brand/assets/courses/python-lab-icon.webp';
import SketchLabIcon from '@/config/brand/assets/courses/sketch-lab-icon.webp';
import SpriteLabIcon from '@/config/brand/assets/courses/sprite-lab-icon.webp';
import WebLab2Icon from '@/config/brand/assets/courses/weblab2-icon.webp';
import CodeAILogo from '@/config/brand/assets/logo-codeai-inverse.svg';

export const BRAND_NAME = 'CodeAI';
export const LOGO_IMAGE_URL = CodeAILogo;

/** Signed-in student menu. A function (see {@link buildGlobalNav}) since `Course Catalog`/`Incubator` resolve via `siteConfig.marketingUrl`. */
export function buildStudentMenuItems(): MenuItem[] {
  return [
    {label: 'My Dashboard', href: '/home'},
    {label: 'Course Catalog', href: siteConfig.marketingUrl('/students')},
    {label: 'Projects', href: '/projects'},
    // Also a global-nav entry; shown on the bar, drawn from the global nav in the hamburger.
    {
      label: 'Incubator',
      href: siteConfig.marketingUrl('/incubator'),
      hideInHamburger: true,
    },
  ];
}

/** Signed-in teacher menu. A function (see {@link buildGlobalNav}) since `Incubator` resolves via `siteConfig.marketingUrl`. */
export function buildTeacherMenuItems(): MenuItem[] {
  return [
    {label: 'My Dashboard', href: '/home'},
    {label: 'Course Catalog', href: '/catalog'},
    {label: 'Projects', href: '/projects'},
    {label: 'Professional Learning', href: '/my-professional-learning'},
    // Also a global-nav entry; shown on the bar, drawn from the global nav in the hamburger.
    {
      label: 'Incubator',
      href: siteConfig.marketingUrl('/incubator'),
      hideInHamburger: true,
    },
  ];
}

/** "New project" picker items. A function (see {@link buildGlobalNav}) since `Mix & Move with AI` resolves via `siteConfig.marketingUrl`. */
export function buildCreateMenuItems(): CreateMenuItem[] {
  return [
    {
      id: 'music_dance_ai',
      label: 'Mix & Move with AI',
      href: siteConfig.marketingUrl('/mix-move-ai'),
      iconUrl: MusicDanceAiIcon,
    },
    {
      id: 'build-lab',
      label: 'Build Lab',
      href: '/projects/build-lab/new',
      iconUrl: AllProjectsIcon,
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
      id: 'sketchlab',
      label: 'Sketch Lab',
      href: '/projects/sketchlab/new',
      iconUrl: SketchLabIcon,
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
}

/**
 * Build the studio global nav. Called lazily (not at module load) so
 * siteConfig is always fully initialised — and test mocks are in place —
 * when hrefs are resolved. Mirrors `getFooterLinks` in config/footerLinks.ts.
 *
 * @returns Ordered array of global nav items.
 */
export function buildGlobalNav(): GlobalNavItem[] {
  return [
    {label: 'Learn', href: siteConfig.marketingUrl('/students')},
    {
      label: 'Teach',
      subItems: [
        {label: 'Educator Overview', href: siteConfig.marketingUrl('/teach')},
        {
          label: 'Elementary School',
          href: siteConfig.marketingUrl(
            '/educate/curriculum/elementary-school',
          ),
        },
        {
          label: 'Middle School',
          href: siteConfig.marketingUrl('/educate/curriculum/middle-school'),
        },
        {
          label: 'High School',
          href: siteConfig.marketingUrl('/educate/curriculum/high-school'),
        },
        {label: 'Hour of AI', href: siteConfig.marketingUrl('/hour-of-ai')},
        {
          label: 'Beyond CodeAI',
          href: siteConfig.marketingUrl('/educate/curriculum/3rd-party'),
        },
        {label: 'Online Community', href: 'https://forum.code.org/'},
        {
          label: 'Technical Requirements',
          href: siteConfig.marketingUrl('/educate/it'),
        },
        {
          label: 'Tools and Videos',
          href: siteConfig.marketingUrl('/educate/resources/videos'),
        },
      ],
    },
    {label: 'Districts', href: siteConfig.marketingUrl('/administrators')},
    {label: 'Stats', href: siteConfig.marketingUrl('/promote')},
    {label: 'Donate', href: siteConfig.marketingUrl('/donate')},
    {label: 'Incubator', href: siteConfig.marketingUrl('/incubator')},
    {
      label: 'About',
      subItems: [
        {label: 'About Us', href: siteConfig.marketingUrl('/about')},
        {
          label: 'Leadership',
          href: siteConfig.marketingUrl('/about/leadership'),
        },
        {label: 'Donors', href: siteConfig.marketingUrl('/about/donors')},
        {label: 'Partners', href: siteConfig.marketingUrl('/about/partners')},
        {label: 'Full Team', href: siteConfig.marketingUrl('/about/team')},
        {label: 'Newsroom', href: siteConfig.marketingUrl('/about/news')},
        {label: 'Careers', href: siteConfig.marketingUrl('/about/jobs')},
        {label: 'Contact Us', href: siteConfig.marketingUrl('/contact')},
        {label: 'FAQs', href: siteConfig.marketingUrl('/faq')},
      ],
    },
    // Legal lives in the hamburger drawer only (matches the legacy header's
    // "Legal" expander); the top bar never shows it.
    {
      label: 'Privacy & Legal',
      hamburgerOnly: true,
      subItems: [
        {label: 'Privacy Policy', href: siteConfig.marketingUrl('/privacy')},
        {label: 'Cookie Notice', href: siteConfig.marketingUrl('/cookies')},
        {
          label: 'Terms of Service',
          href: siteConfig.marketingUrl('/terms-of-service'),
        },
      ],
    },
  ];
}

/**
 * Signed-out marketing navigation. Advocacy is an absolute external host, so
 * it's used as-is rather than resolved through `siteConfig.marketingUrl`.
 * About and Donate are `alignEnd`, pinning them to the trailing edge of the bar.
 *
 * Keep in sync with the signed-out marketing nav served by the Rails studio
 * header.
 *
 * A function (not a static export, like {@link buildSupportLinks}) because
 * `siteConfig.marketingUrl` needs `siteConfig` fully initialised, which a
 * module-load-time array can't guarantee — see getFooterLinks in
 * config/footerLinks.ts for the same pattern.
 *
 * @returns Ordered marketing nav items.
 */
export function buildMarketingGlobalNav(): GlobalNavItem[] {
  return [
    {label: 'Teachers', href: siteConfig.marketingUrl('/teachers')},
    {label: 'Districts', href: siteConfig.marketingUrl('/districts')},
    {label: 'Advocacy', href: 'https://advocacy.code.org'},
    {label: 'Hour of AI', href: siteConfig.marketingUrl('/hour-of-ai')},
    {label: 'Parents', href: siteConfig.marketingUrl('/parents')},
    {label: 'Students', href: siteConfig.marketingUrl('/students')},
    {label: 'About', href: siteConfig.marketingUrl('/about'), alignEnd: true},
    {
      label: 'Donate',
      href: siteConfig.marketingUrl('/donate'),
      alignEnd: true,
    },
  ];
}

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
