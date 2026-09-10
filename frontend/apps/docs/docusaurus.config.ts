import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CodeAI Documentation',
  tagline: 'Help for users and developers of CodeAI.',
  favicon: 'img/logo.png',
  url: 'https://docs.code.org',
  baseUrl: '/',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    format: 'md',
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../../../docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Only include the two audience roots and the landing page.
          include: [
            'index.md',
            'guide/**/*.md',
            'developers/**/*.md',
          ],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        docsRouteBasePath: '/',
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'CodeAI Docs',
      logo: {
        alt: 'Code.org logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'guide/index',
          label: 'User guide',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'developers/index',
          label: 'Developers',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `Copyright ${new Date().getFullYear()} Code.org`,
    },
    colorMode: {
      // The design system has dark tokens ([data-theme='Dark']) but Docusaurus
      // uses prefers-color-scheme + data-theme=dark. Disable the toggle rather
      // than inventing a mapping.
      disableSwitch: true,
      defaultMode: 'light',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
