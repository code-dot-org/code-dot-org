/* eslint-disable @typescript-eslint/no-explicit-any */

import FullWidthActionBlock from '@/components/contentful/actionBlocks/fullWidthActionBlock';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

const meta: Meta<typeof FullWidthActionBlock> = {
  title: 'Marketing/ActionBlocks/FullWidthActionBlock',
  component: FullWidthActionBlock,
};
export default meta;

type Story = StoryObj<typeof FullWidthActionBlock>;

export const WithAllContent: Story = {
  args: {
    className: '',
    overline: 'K-12 Teachers',
    title: '❌ [ENG] Self-Paced PL 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    image:
      '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png' as any,
    primaryButton: {
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
    secondaryButton: {
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
        id: '49SifjEqSHArcx1iEiSw4o',
        type: 'Entry',
        createdAt: '2025-04-08T15:57:56.936Z',
        updatedAt: '2025-07-23T18:10:12.974Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 390,
        revision: 23,
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
        linkName: '❌ [ENG] Secondary button test',
        label: 'Secondary button test',
        primaryTarget: '/ping',
        isThisAnExternalLink: false,
        ariaLabel: 'Secondary button test',
      },
    },
    videoShowCaption: false,
    background: 'primary',
    children: null,
  },
  play: async ({canvas}) => {
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((heading: HTMLElement) =>
      expect(heading).toBeInTheDocument(),
    );
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link: HTMLElement) => expect(link).toBeInTheDocument());
  },
};

export const WithExternalLinkButtons: Story = {
  args: {
    className: '',
    overline: 'K-12 Teachers',
    title: '❌ [ENG] Self-Paced PL 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    image:
      '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png' as any,
    primaryButton: {
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
        id: '5CznPyR4ZsbIkhpwSaUxoe',
        type: 'Entry',
        createdAt: '2025-04-08T15:58:23.765Z',
        updatedAt: '2025-07-23T18:10:12.943Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 189,
        revision: 19,
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
        linkName: '❌ [ENG] External link button test',
        label: 'External link button test',
        primaryTarget: 'https://google.com',
        isThisAnExternalLink: true,
        ariaLabel: 'External link button test',
      },
    },
    secondaryButton: {
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
        id: '5CznPyR4ZsbIkhpwSaUxoe',
        type: 'Entry',
        createdAt: '2025-04-08T15:58:23.765Z',
        updatedAt: '2025-07-23T18:10:12.943Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 189,
        revision: 19,
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
        linkName: '❌ [ENG] External link button test',
        label: 'External link button test',
        primaryTarget: 'https://google.com',
        isThisAnExternalLink: true,
        ariaLabel: 'External link button test',
      },
    },
    videoShowCaption: false,
    background: 'primary',
    children: null,
  },
  play: async ({canvas}) => {
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((heading: HTMLElement) =>
      expect(heading).toBeInTheDocument(),
    );
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link: HTMLElement) => expect(link).toBeInTheDocument());
  },
};

export const WithSecondaryBackground: Story = {
  args: {
    className: '',
    overline: 'K-12 Teachers',
    title: '❌ [ENG] Self-Paced PL 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
    image:
      '//contentful-images.code.org/90t6bu6vlf76/6fdNRFZbNXpiXQd6v7fHen/d6328a3a965b3daca5fb0375caf72064/image-component.png' as any,
    primaryButton: {
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
    secondaryButton: {
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
        id: '49SifjEqSHArcx1iEiSw4o',
        type: 'Entry',
        createdAt: '2025-04-08T15:57:56.936Z',
        updatedAt: '2025-07-23T18:10:12.974Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        publishedVersion: 390,
        revision: 23,
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
        linkName: '❌ [ENG] Secondary button test',
        label: 'Secondary button test',
        primaryTarget: '/ping',
        isThisAnExternalLink: false,
        ariaLabel: 'Secondary button test',
      },
    },
    videoShowCaption: false,
    background: 'secondary',
    children: null,
  },
  play: async ({canvas}) => {
    const headings = canvas.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((heading: HTMLElement) =>
      expect(heading).toBeInTheDocument(),
    );
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link: HTMLElement) => expect(link).toBeInTheDocument());
  },
};
