import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const SkinnyBannerContentfulComponentDefinition: ComponentDefinition = {
  id: 'skinnyBanner',
  name: 'Skinny Banner',
  category: '04: Advanced',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/6haDMlmkFkctoCi0z33L1D/33facc2c4dedef85e2a3a24368e6e043/c75b6c340ecf8b29cb58b71615c35e0a7289bb16.png',
  tooltip: {
    description:
      'A full-width marketing banner placed inline with content. Supports backgrounds, images, text, and a CTA.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/7n6rxyZttjZIhQ1Px0mZZ0/379131d97fa17843eac261b7c34edda8/a50cbd9e23eaf5865b005ac1abcf235a15b07b7a.png',
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
    description: {
      displayName: 'Description',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    sectionImages: {
      displayName: 'Section Image',
      type: 'Array',
      group: 'content',
      validations: {
        bindingSourceType: ['entry'],
        required: true,
      },
    },
    backgroundImage: {
      displayName: 'Section Background Image',
      type: 'Media',
      group: 'content',
      validations: {
        bindingSourceType: ['asset'],
      },
    },
    buttonLinks: {
      displayName: 'Primary Button',
      type: 'Array',
      group: 'content',
      description:
        'This is the link that will be used in the button. This should be a link entry.',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    partnerCallout: {
      displayName: 'Partner Callout Text',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    partnerLogo: {
      displayName: 'Partner Logo',
      type: 'Media',
      group: 'content',
      validations: {
        bindingSourceType: ['asset'],
      },
    },
  },
};
