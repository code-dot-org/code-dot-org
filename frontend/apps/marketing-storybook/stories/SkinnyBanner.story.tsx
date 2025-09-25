/* eslint-disable @typescript-eslint/no-explicit-any */

import SkinnyBanner from '@/components/contentful/skinnyBanner';
import {Meta, StoryObj} from '@storybook/react';

import SkinnyBannerMock from './__mocks__/SkinnyBanner.json';

const meta: Meta<typeof SkinnyBanner> = {
  title: 'Marketing/SkinnyBanner',
  component: SkinnyBanner,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const LightBackground: StoryObj<typeof SkinnyBanner> = {
  args: SkinnyBannerMock as any,
};

export const DarkBackground: StoryObj<typeof SkinnyBanner> = {
  args: {
    ...SkinnyBannerMock,
    heading: 'Skinny Banner Dark Background',
    contentMode: 'Dark',
  } as any,
};

export const ImageBackground: StoryObj<typeof SkinnyBanner> = {
  args: {
    ...SkinnyBannerMock,
    heading: 'Skinny Banner Image Background',
    contentMode: 'Dark',
    description:
      'Praesent eget risus vitae massa semper aliquam quis mattis quam. Morbi vitae tortor tempus, placerat leo et, suscipit lectus.',
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
    backgroundImage:
      '//contentful-images.code.org/90t6bu6vlf76/5CxK7pS9iAl2fs6smAtV3Z/0d127bb5e1bd745fee89c9e2a4cbec9e/ai-bg.png',
  } as any,
};
