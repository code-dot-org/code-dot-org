import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';

import {loadFonts, injectFontAwesome} from '@code-dot-org/fonts';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/fonts/brands/CSForAll/index.css';
import cdoTheme from '../../marketing/src/themes/code.org';
import csforallTheme from '../../marketing/src/themes/csforall';
import './preview.module.scss';

injectFontAwesome();

const inMemoryEntities = useInMemoryEntities();

inMemoryEntities.addEntities([
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '5PQ3scGgrxZeBGJ4M3oXde',
      type: 'Asset',
      createdAt: '2025-04-23T21:40:10.428Z',
      updatedAt: '2025-07-03T15:27:28.748Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 5,
      revision: 2,
      locale: 'en-US',
    },
    fields: {
      title: 'Microsoft Logo',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/5PQ3scGgrxZeBGJ4M3oXde/27a23e4679af21c33097d513b55ca0dd/microsoft.png',
        details: {
          size: 4942,
          image: {
            width: 1024,
            height: 218,
          },
        },
        fileName: 'microsoft.png',
        contentType: 'image/png',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '6dKwFBFEBdFlARthWp3NPS',
      type: 'Entry',
      createdAt: '2025-06-18T21:48:54.889Z',
      updatedAt: '2025-07-02T20:15:23.761Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 10,
      revision: 4,
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'link',
        },
      },
      locale: 'en-US',
    },
    fields: {
      linkName: '❌ [ENG] Amazon Link TEST',
      label: 'Amazon',
      primaryTarget: 'https://amazon.com',
      isThisAnExternalLink: true,
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '7ojmgHRZ58dXVrwArsB87Q',
      type: 'Asset',
      createdAt: '2025-04-23T21:41:40.053Z',
      updatedAt: '2025-07-14T17:28:57.079Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 8,
      revision: 3,
      locale: 'en-US',
    },
    fields: {
      title: 'amazon logo',
      description: 'amazon logo',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/7ojmgHRZ58dXVrwArsB87Q/3c0e85d48cba810af1f47269fddda347/Amazon_2024.svg',
        details: {
          size: 12752,
          image: {
            width: 1507,
            height: 505,
          },
        },
        fileName: 'Amazon_2024.svg',
        contentType: 'image/svg+xml',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '6fdNRFZbNXpiXQd6v7fHen',
      type: 'Asset',
      createdAt: '2025-04-23T21:39:00.300Z',
      updatedAt: '2025-07-12T14:45:59.774Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 27,
      revision: 8,
      locale: 'en-US',
    },
    fields: {
      title: 'Image component test image',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/283802ca53f84a232f5c602f22640825/image-component.png',
        details: {
          size: 330078,
          image: {
            width: 1200,
            height: 700,
          },
        },
        fileName: 'image-component.png',
        contentType: 'image/png',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      type: 'Asset',
      id: '46WnKBOGVA8e4bFtBSRPuE',
      revision: 1,
      createdAt: '2025-04-23T21:00:27.764Z',
      updatedAt: '2025-04-25T17:13:59.767Z',
      publishedAt: '2025-04-23T21:39:48.672Z',
      firstPublishedAt: '2025-04-23T21:39:48.672Z',
      publishedVersion: 2,
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      locale: 'en-US',
    },
    fields: {
      title: 'teach-page-top',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/46WnKBOGVA8e4bFtBSRPuE/7dfb9f86c13b035a49c295e0f62a48b4/teach-page-top.png',
        details: {
          size: 176607,
          image: {
            width: 800,
            height: 545,
          },
        },
        fileName: 'teach-page-top.png',
        contentType: 'image/png',
      },
    },
  },

  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      type: 'Asset',
      id: '46WnKBOGVA8e4bFtBSRPuE',
      revision: 1,
      createdAt: '2025-04-23T21:00:27.764Z',
      updatedAt: '2025-04-25T17:13:59.767Z',
      publishedAt: '2025-04-23T21:39:48.672Z',
      firstPublishedAt: '2025-04-23T21:39:48.672Z',
      publishedVersion: 2,
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      locale: 'en-US',
    },
    fields: {
      title: 'teach-page-top',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/46WnKBOGVA8e4bFtBSRPuE/7dfb9f86c13b035a49c295e0f62a48b4/teach-page-top.png',
        details: {
          size: 176607,
          image: {
            width: 800,
            height: 545,
          },
        },
        fileName: 'teach-page-top.png',
        contentType: 'image/png',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      type: 'Entry',
      id: '79dI2fR2dzbb0IN3dFQJ3t',
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'link',
        },
      },
      revision: 4,
      createdAt: '2025-04-28T17:12:29.695Z',
      updatedAt: '2025-07-23T18:02:19.027Z',
      publishedAt: '2025-07-02T20:13:16.886Z',
      firstPublishedAt: '2025-04-28T17:15:38.181Z',
      publishedVersion: 213,
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      locale: 'en-US',
    },
    fields: {
      linkName: '❌ [ENG] Primary button test',
      label: 'Primary button test',
      primaryTarget: '/ping',
      isThisAnExternalLink: false,
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '2BrqKCCWUw4Ns8lf1BeXuA',
      type: 'Asset',
      createdAt: '2025-04-23T21:39:37.241Z',
      updatedAt: '2025-04-23T21:39:37.241Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 2,
      revision: 1,
      locale: 'en-US',
    },
    fields: {
      title: 'Clever Logo (Color)',
      description: "Clever's logo",
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/2BrqKCCWUw4Ns8lf1BeXuA/08f20205c0b134089a5bfad153c72b3b/logo.png',
        details: {
          size: 8215,
          image: {
            width: 382,
            height: 102,
          },
        },
        fileName: 'logo.png',
        contentType: 'image/png',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '6SvP2wibIZUufai9LgLaS2',
      type: 'Asset',
      createdAt: '2025-04-23T21:39:38.090Z',
      updatedAt: '2025-04-23T21:39:38.090Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 2,
      revision: 1,
      locale: 'en-US',
    },
    fields: {
      title: 'Schoology logo',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/6SvP2wibIZUufai9LgLaS2/f3fb15804eef37e2dfccffd6a1676da6/lms_schoology_logo.png',
        details: {
          size: 41916,
          image: {
            width: 1280,
            height: 256,
          },
        },
        fileName: 'lms_schoology_logo.png',
        contentType: 'image/png',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '3UaLznScxJz5Y3eN1mlKMY',
      type: 'Entry',
      createdAt: '2025-06-23T17:53:47.804Z',
      updatedAt: '2025-07-02T20:14:46.530Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 9,
      revision: 4,
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'link',
        },
      },
      locale: 'en-US',
    },
    fields: {
      linkName: '❌ [ENG] Schoology TEST',
      label: 'Schoology',
      primaryTarget:
        'https://www.powerschool.com/solutions/personalized-learning/schoology-learning/',
      isThisAnExternalLink: true,
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '7aCApN8gyhhPHTvHOMItSN',
      type: 'Asset',
      createdAt: '2025-04-23T21:39:37.765Z',
      updatedAt: '2025-04-23T21:39:37.765Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 2,
      revision: 1,
      locale: 'en-US',
    },
    fields: {
      title: 'Microsoft Square Logo',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/4k2CBEbZGR9zaraf9Ax7I1/646c5837d809097874e7b46aeed65d0d/microsoft.png',
        details: {
          size: 95754,
          image: {
            width: 1271,
            height: 224,
          },
        },
        fileName: 'googleclassroom.png',
        contentType: 'image/png',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '5j9YYfi7OAiT8hR2ZKsWdX',
      type: 'Asset',
      createdAt: '2025-04-23T21:39:37.765Z',
      updatedAt: '2025-04-23T21:39:37.765Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 2,
      revision: 1,
      locale: 'en-US',
    },
    fields: {
      title: 'Google Classroom Logo',
      description: '',
      file: {
        url: '//contentful-images.code.org/90t6bu6vlf76/5j9YYfi7OAiT8hR2ZKsWdX/81eb1d873acd951f64aff63c04d4d66f/googleclassroom.png',
        details: {
          size: 95754,
          image: {
            width: 1271,
            height: 224,
          },
        },
        fileName: 'googleclassroom.png',
        contentType: 'image/png',
      },
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '4shm3jYrTHk9uBKkgQMQf6',
      type: 'Entry',
      createdAt: '2025-06-23T17:55:38.964Z',
      updatedAt: '2025-07-02T20:14:35.300Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 9,
      revision: 4,
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'link',
        },
      },
      locale: 'en-US',
    },
    fields: {
      linkName: '❌ [ENG] Google Classroom TEST',
      label: 'Google Classroom',
      primaryTarget:
        'https://edu.google.com/workspace-for-education/products/classroom/',
      isThisAnExternalLink: true,
    },
  },
]);

/**
 * Ensure fonts are loaded prior to rendering the story
 */
const fontLoader = async () => {
  return {
    fonts: await loadFonts(),
  };
};

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      'code.org': cdoTheme,
      csforall: csforallTheme,
    },
    defaultTheme: 'code.org',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
];

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',

      options: {
        rules: {
          'color-contrast': {enabled: false},
        },
      },
    },
  },
};
export const loaders = document.fonts ? [fontLoader] : [];

export default preview;
