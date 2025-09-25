import HeroBanner from '@/components/contentful/heroBanner';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

const meta: Meta<typeof HeroBanner> = {
  title: 'Marketing/HeroBanner',
  component: HeroBanner,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof HeroBanner>;

// Playground story
export const Playground: Story = {
  args: {
    contentMode: 'Light',
    imageSize: 'Big',
    heading: 'Playground Hero Banner',
  },
};

export const Basic: Story = {
  args: {
    className: 'cf-7aa4a121f2a94c53dc4efc4f0cd1ee60',
    heading: 'Hero Banner Basic',
    subHeading: 'Hero banner subheading',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    buttonLinks: [
      {
        contentTypeId: 'link',
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
          id: '79dI2fR2dzbb0IN3dFQJ3t',
          type: 'Entry',
          createdAt: '2025-04-08T15:57:33.257Z',
          updatedAt: '2025-07-23T18:10:13.079Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 430,
          revision: 20,
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
          linkName: '❌ [ENG] Primary button test',
          label: 'Primary button test',
          primaryTarget: '/ping',
          isThisAnExternalLink: false,
        },
      },
    ],
    contentMode: 'Light',
    imageSize: 'Big',
    sectionVideoShowCaption: true,
    hideImageOnSmallScreen: false,
  },
};

export const WithImageBig: Story = {
  args: {
    className: 'cf-d38a79cc60d6b99f6c5bb47b4507ab2a',
    heading: 'Hero Banner with Image Big',
    subHeading: 'Hero Banner Basic',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    sectionImages: [
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
          createdAt: '2025-03-10T17:47:45.550Z',
          updatedAt: '2025-03-11T23:01:17.123Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 13,
          revision: 2,
          locale: 'en-US',
        },
        fields: {
          title: 'Image component test image',
          description: '',
          file: {
            url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
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
    ],
    buttonLinks: [
      {
        contentTypeId: '123',
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
          id: '79dI2fR2dzbb0IN3dFQJ3t',
          type: 'Entry',
          createdAt: '2025-04-08T15:57:33.257Z',
          updatedAt: '2025-07-23T18:10:13.079Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 430,
          revision: 20,
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
          linkName: '❌ [ENG] Primary button test',
          label: 'Primary button test',
          primaryTarget: 'about:blank',
          isThisAnExternalLink: false,
        },
      },
    ],
    contentMode: 'Light',
    imageSize: 'Big',
    sectionVideoShowCaption: true,
    hideImageOnSmallScreen: false,
  },
  play: async ({canvas}) => {
    // Check heading
    const heading = await canvas.findByRole('heading', {
      name: /hero banner with image big/i,
    });
    expect(heading).toBeInTheDocument();
    // Check button
    const button = await canvas.findByRole('link', {
      name: /primary button test/i,
    });
    expect(button).toHaveAttribute('href', 'about:blank');
  },
};

export const WithImageSmall: Story = {
  args: {
    className: 'cf-0aa7b85e9c9e544b0fad4b86fd8dc938',
    heading: 'Hero Banner with Image Small',
    subHeading: 'Hero Banner Basic',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    sectionImages: [
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
          createdAt: '2025-03-10T17:47:45.550Z',
          updatedAt: '2025-03-11T23:01:17.123Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 13,
          revision: 2,
          locale: 'en-US',
        },
        fields: {
          title: 'Image component test image',
          description: '',
          file: {
            url: '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png',
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
    ],
    buttonLinks: [
      {
        contentTypeId: '123',
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
          id: '79dI2fR2dzbb0IN3dFQJ3t',
          type: 'Entry',
          createdAt: '2025-04-08T15:57:33.257Z',
          updatedAt: '2025-07-23T18:10:13.079Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 430,
          revision: 20,
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
          linkName: '❌ [ENG] Primary button test',
          label: 'Primary button test',
          primaryTarget: 'about:blank',
          isThisAnExternalLink: false,
        },
      },
    ],
    contentMode: 'Light',
    imageSize: 'Small',
    sectionVideoShowCaption: true,
    hideImageOnSmallScreen: false,
  },
  play: async ({canvas}) => {
    const heading = await canvas.findByRole('heading', {
      name: /hero banner with image small/i,
    });
    expect(heading).toBeInTheDocument();
    const button = await canvas.findByRole('link', {
      name: /primary button test/i,
    });
    expect(button).toHaveAttribute('href', 'about:blank');
  },
};

export const WithVideo: Story = {
  args: {
    className: 'cf-d5979497d9465d7971a6b8f7714cbe37',
    heading: 'Hero Banner with Video',
    subHeading: 'Hero Banner Basic',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    sectionVideoTitle: "What Most Schools Don't Teach",
    sectionVideoYouTubeId: 'nKIu9yen5nc',
    sectionVideoFallback:
      'https://contentful-videos.code.org/90t6bu6vlf76/5Unfit2zLyqPp9HofyWU9T/4f0a43abe3dc649dc752ca321f1945c7/what-most-schools-dont-teach.mp4',
    buttonLinks: [
      {
        contentTypeId: 'link',
        metadata: {tags: [], concepts: []},
        sys: {
          space: {sys: {type: 'Link', linkType: 'Space', id: '90t6bu6vlf76'}},
          id: '79dI2fR2dzbb0IN3dFQJ3t',
          type: 'Entry',
          createdAt: '2025-04-08T15:57:33.257Z',
          updatedAt: '2025-07-23T18:10:13.079Z',
          environment: {
            sys: {id: 'master', type: 'Link', linkType: 'Environment'},
          },
          publishedVersion: 430,
          revision: 20,
          contentType: {
            sys: {type: 'Link', linkType: 'ContentType', id: 'link'},
          },
          locale: 'en-US',
        },
        fields: {
          linkName: '❌ [ENG] Primary button test',
          label: 'Primary button test',
          primaryTarget: 'about:blank',
          isThisAnExternalLink: false,
        },
      },
    ],
    contentMode: 'Light',
    imageSize: 'Big',
    sectionVideoShowCaption: true,
    hideImageOnSmallScreen: false,
  },
  play: async ({canvas}) => {
    const heading = await canvas.findByRole('heading', {
      name: /hero banner with video/i,
    });
    expect(heading).toBeInTheDocument();
    const button = await canvas.findByRole('link', {
      name: /primary button test/i,
    });
    expect(button).toHaveAttribute('href', 'about:blank');
    // Video caption
    const caption = await canvas.findByText(/what most schools don't teach/i);
    expect(caption).toBeInTheDocument();
  },
};

export const WithPartnerCallout: Story = {
  args: {
    className: 'cf-ad95b34c261749e94dd484ea51620313',
    heading: 'Hero Banner with Partner Callout',
    subHeading: 'Hero banner subheading',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    buttonLinks: [
      {
        contentTypeId: 'link',
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
          id: '79dI2fR2dzbb0IN3dFQJ3t',
          type: 'Entry',
          createdAt: '2025-04-08T15:57:33.257Z',
          updatedAt: '2025-07-23T18:10:13.079Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 430,
          revision: 20,
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
          linkName: '❌ [ENG] Primary button test',
          label: 'Primary button test',
          primaryTarget: 'about:blank',
          isThisAnExternalLink: false,
        },
      },
    ],
    partnerCallout: 'In partnership with',
    partnerLogo:
      '//contentful-images.code.org/90t6bu6vlf76/6TJZRnAUG6nipPqCP7pVFL/881151ccc632b92e38ef7693d77fab90/afe-d1c13b2b5d11e6d1eac3bfb83774614c.png',
    contentMode: 'Light',
    imageSize: 'Big',
    sectionVideoShowCaption: true,
    hideImageOnSmallScreen: false,
  },
  play: async ({canvas}) => {
    const heading = await canvas.findByRole('heading', {
      name: /hero banner with partner callout/i,
    });
    expect(heading).toBeInTheDocument();
    const partner = await canvas.findByText(/in partnership with/i);
    expect(partner).toBeInTheDocument();
  },
};

export const WithAnnouncementBanner: Story = {
  args: {
    className: 'cf-07bb595485580a69861e545d6487e742',
    heading: 'Hero Banner with Announcement Banner',
    subHeading: 'Hero banner subheading',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    buttonLinks: [
      {
        contentTypeId: 'link',
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
          id: '79dI2fR2dzbb0IN3dFQJ3t',
          type: 'Entry',
          createdAt: '2025-04-08T15:57:33.257Z',
          updatedAt: '2025-07-23T18:10:13.079Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 430,
          revision: 20,
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
          linkName: '❌ [ENG] Primary button test',
          label: 'Primary button test',
          primaryTarget: 'about:blank',
          isThisAnExternalLink: false,
        },
      },
    ],
    partnerCallout: 'In partnership with',
    announcementBannerText: 'This is an announcement banner!',
    announcementBannerLink: [
      {
        contentTypeId: 'link',
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
          id: '1MRgVjtophe1CDjLbTpqXz',
          type: 'Entry',
          createdAt: '2025-06-02T21:36:53.216Z',
          updatedAt: '2025-07-23T18:10:14.345Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 40,
          revision: 16,
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
          linkName: '❌ [ENG] Announcement banner link test',
          label: 'Announcement banner link',
          primaryTarget: 'about:blank',
          isThisAnExternalLink: false,
        },
      },
    ],
    contentMode: 'Light',
    imageSize: 'Big',
    sectionVideoShowCaption: true,
    hideImageOnSmallScreen: false,
    announcementBannerIconName: 'smile',
  },
  play: async ({canvas}) => {
    const heading = await canvas.findByRole('heading', {
      name: /hero banner with announcement banner/i,
    });
    expect(heading).toBeInTheDocument();
    const announcement = await canvas.findByText(
      /this is an announcement banner!/i,
    );
    expect(announcement).toBeInTheDocument();
    const link = await canvas.findByRole('link', {
      name: /announcement banner link/i,
    });
    expect(link).toHaveAttribute('href', 'about:blank');
  },
};
