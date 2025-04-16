import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const HeroBannerContentfulComponentDefinition: ComponentDefinition = {
  id: 'heroBanner',
  name: 'Hero Banner (Add me first!)',
  category: '01: Page Structure',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/67aFKYrjrRbMNjKEmtXHHe/99e04a9a3ea65b519ca13a83713b92f8/8e462e79b08569d982fa2c794d937e60.png',
  tooltip: {
    description:
      'Use this as an opening section on all pages. Supports backgrounds, media, text, and CTAs, and an optional announcement strip.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/4dPbIf680q8TdPkclC2iWc/e5c7603213244f437b38844cc981c3af/95755ce51ecc6c825f50de34f1c419a4.png',
  },
  builtInStyles: ['cfBackgroundColor'],
  variables: {
    // Style Props:
    contentMode: {
      displayName: 'Content Mode',
      type: 'Text',
      defaultValue: 'Light',
      group: 'style',
      validations: {
        in: [
          {value: 'Light', displayName: 'Light'},
          {value: 'Dark', displayName: 'Dark'},
        ],
      },
    },
    imageSize: {
      displayName: 'Image Size',
      type: 'Text',
      defaultValue: 'Big',
      group: 'style',
      validations: {
        in: [
          {value: 'Big', displayName: 'Big'},
          {value: 'Large', displayName: 'Large'},
        ],
      },
    },
    removeBackground: {
      displayName: 'Remove Background?',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    // Content Props:
    heading: {
      displayName: 'Heading',
      type: 'Text',
      group: 'content',
      validations: {
        required: true,
        bindingSourceType: ['entry', 'manual'],
      },
    },
    subHeading: {
      displayName: 'Subheading',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    description: {
      displayName: 'Description',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    sectionImage: {
      displayName: 'Section Image',
      type: 'Media',
      group: 'content',
      validations: {
        bindingSourceType: ['asset'],
        required: true,
      },
    },
    sectionVideoTitle: {
      displayName: 'Video title',
      type: 'Text',
      group: 'content',
      description:
        'The title of the video. This will double as the caption under the video player.',
    },
    sectionVideoYouTubeId: {
      displayName: 'Video YouTube ID',
      type: 'Text',
      group: 'content',
      description:
        'The YouTube ID of the video. This is the unique identifier for the video on YouTube.',
    },
    sectionVideoFallback: {
      displayName: 'Video fallback',
      type: 'Text',
      group: 'content',
      description:
        'This is the URL of the video that will be used in place of the YouTube video if YouTube is blocked.',
    },
    sectionVideoShowCaption: {
      displayName: 'Show video caption',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
      description:
        'Check this to show a caption (video title) under the video player.',
    },
    // sectionVideo: {
    //   displayName: 'Section Video',
    //   type: 'Media',
    //   group: 'content',
    //   validations: {
    //     bindingSourceType: ['asset'],
    //   },
    // },
    buttonLabel: {
      displayName: 'Button Label',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    buttonUrl: {
      displayName: 'Button Link URL',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    buttonIsLinkExternal: {
      displayName:
        'Is this link external? (Does this link leave the code.org site?)',
      description:
        'External links will be opened in a new tab, while internal links will be opened in the same tab.',
      type: 'Boolean',
      defaultValue: false,
      group: 'content',
    },
    buttonAriaLabel: {
      displayName: 'Button Aria Label',
      type: 'Text',
      group: 'content',
    },
    partnerLogo: {
      displayName: 'Partner Logo',
      type: 'Media',
      group: 'content',
      validations: {
        bindingSourceType: ['asset'],
      },
    },
    partnerCallout: {
      displayName: 'Partner Callout',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    backgroundImage: {
      displayName: 'Background Image',
      type: 'Media',
      group: 'content',
      validations: {
        bindingSourceType: ['asset'],
      },
    },
  },
};
