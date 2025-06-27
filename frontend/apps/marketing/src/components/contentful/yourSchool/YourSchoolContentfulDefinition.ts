import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const YourSchoolContentfulComponentDefinition: ComponentDefinition = {
  id: 'yourSchool',
  name: 'Your School Section',
  category: '08: Advanced',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/7AQEnvhSJQ8soeLBW59OPt/039542002c637180f656f56b3ab2598c/component_your_school_thumbnail.png',
  tooltip: {
    description:
      'This component embeds the interactive “Your School” map and survey page sections is intended for use on a specific page.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/4z6O754KxXEBMWCpnYJJ9f/e6009ab7a2326507075431ccfc8e82b3/component_your_school_tooltip.png',
  },
  variables: {
    dataSourceURL: {
      displayName: 'Data Source URL',
      type: 'Text',
      group: 'content',
      description: 'The URL of the data source that Code.org uses for the map.',
      defaultValue: 'https://advocacy.code.org/report-data',
      validations: {
        required: true,
        bindingSourceType: ['manual', 'entry'],
      },
    },
    regionalPartnerURL: {
      displayName: 'Regional Partner URL',
      type: 'Text',
      group: 'content',
      description: 'The URL of the regional partner page.',
      defaultValue:
        'https://code.org/professional-learning/regional-partner-program',
      validations: {
        required: true,
        bindingSourceType: ['manual', 'entry'],
      },
    },
    privacyPolicyURL: {
      displayName: 'Privacy Policy URL',
      type: 'Text',
      group: 'content',
      description: 'The URL of the privacy policy page.',
      defaultValue: 'https://code.org/privacy',
      validations: {
        required: true,
        bindingSourceType: ['manual', 'entry'],
      },
    },
    shareOnTwitterURL: {
      displayName: 'Share on Twitter URL',
      type: 'Text',
      group: 'content',
      description:
        'The URL is for composing a tweet on Twitter with pre-filled text and a share link.',
      defaultValue:
        'https://twitter.com/intent/tweet?related=codeorg&text=Does+your+school+teach+computer+science%3F+Expand+computer+science+at+your+school+or+district.+%40codeorg&url=https%3A%2F%2Fcode.org%2Fyour-school',
      validations: {
        required: true,
        bindingSourceType: ['manual', 'entry'],
      },
    },
    shareOnFacebookURL: {
      displayName: 'Share on Facebook URL',
      type: 'Text',
      group: 'content',
      description:
        'The URL opens Facebook’s share dialog to share the specified link',
      defaultValue:
        'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcode.org%2Fyour-school',
      validations: {
        required: true,
        bindingSourceType: ['manual', 'entry'],
      },
    },
  },
};
