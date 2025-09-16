import {ComponentDefinitionVariable} from '@contentful/experiences-core/types';

export const componentSizeXSToLDefinition: ComponentDefinitionVariable = {
  displayName: 'Size',
  type: 'Text',
  group: 'style',
  defaultValue: 'm',
  validations: {
    in: [
      {value: 'l', displayName: 'Large'},
      {value: 'm', displayName: 'Medium'},
      {value: 's', displayName: 'Small'},
      {value: 'xs', displayName: 'Extra Small'},
    ],
  },
};

export const marginBottomNoneToMDefinition = {
  displayName: 'Margin bottom',
  type: 'Text',
  defaultValue: 'xs',
  group: 'style',
  validations: {
    in: [
      {value: 'none', displayName: 'None'},
      {value: 'xs', displayName: 'Extra Small'},
      {value: 's', displayName: 'Small'},
      {value: 'm', displayName: 'Medium'},
    ],
  },
};

export const removeMarginBottomDefinition: ComponentDefinitionVariable = {
  displayName: 'Remove margin bottom',
  type: 'Boolean',
  defaultValue: false,
  group: 'style',
};

export const videoRelatedDefinitions: Record<
  string,
  ComponentDefinitionVariable
> = {
  videoTitle: {
    displayName: 'Video title',
    type: 'Text',
    group: 'content',
    description:
      'The title of the video. This will double as the caption under the video player.',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  videoYouTubeId: {
    displayName: 'Video YouTube ID',
    type: 'Text',
    group: 'content',
    description:
      'The YouTube ID of the video. This is the unique identifier for the video on YouTube.',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  videoFallback: {
    displayName: 'Video fallback',
    type: 'Text',
    group: 'content',
    description:
      'This is the URL of the video that will be used in place of the YouTube video if YouTube is blocked.',
    validations: {
      bindingSourceType: ['entry', 'manual'],
    },
  },
  videoShowCaption: {
    displayName: 'Show video caption',
    type: 'Boolean',
    defaultValue: false,
    group: 'style',
    description:
      'Check this to show a caption (video title) under the video player.',
  },
};

// Used in the Action Block Collection, Logo Collection, and People Collection components.
export const collectionsSortOrderDefinition: Record<
  string,
  ComponentDefinitionVariable
> = {
  sortOrder: {
    displayName: 'Sort Order',
    type: 'Text',
    defaultValue: 'alphabetical',
    group: 'style',
    validations: {
      in: [
        {value: 'alphabetical', displayName: 'Alphabetical'},
        {value: 'manual', displayName: 'Manual'},
      ],
    },
  },
};

// Used in the Action Block Collection, Logo Collection, and People Collection components,
// and could be used in other components.
export const hideImagesDefinition: Record<string, ComponentDefinitionVariable> =
  {
    hideImages: {
      displayName: 'Hide images',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
  };

// Used in the Image component
export const imageSrcDefinition: Record<string, ComponentDefinitionVariable> = {
  src: {
    displayName: 'Image source',
    type: 'Media',
    defaultValue: undefined,
    group: 'content',
    validations: {
      bindingSourceType: ['asset', 'manual'],
    },
  },
};

export const imageAltTextDefinition: Record<
  string,
  ComponentDefinitionVariable
> = {
  altText: {
    displayName: 'Alt text',
    type: 'Text',
    defaultValue: '',
    group: 'content',
    validations: {
      bindingSourceType: ['asset', 'manual', 'entry'],
    },
  },
};

export const imageHasRoundedCornersDefinition: Record<
  string,
  ComponentDefinitionVariable
> = {
  hasRoundedCorners: {
    displayName: 'Rounded corners',
    type: 'Boolean',
    defaultValue: true,
    group: 'style',
  },
};

// Used in the Section component
export const sectionPaddingDefinition: Record<
  string,
  ComponentDefinitionVariable
> = {
  padding: {
    displayName: 'Padding',
    type: 'Text',
    group: 'style',
    description: 'Adds medium or large padding to the section.',
    defaultValue: 'l',
    validations: {
      in: [
        {value: 'm', displayName: 'Medium'},
        {value: 'l', displayName: 'Large'},
        {value: 'none', displayName: 'None'},
      ],
    },
  },
};

// Used in the Section component
export const sectionIdDefinition: Record<string, ComponentDefinitionVariable> =
  {
    id: {
      displayName: 'Section ID',
      type: 'Text',
      group: 'content',
      description: 'Adds a custom ID to a section; can be used for skip links.',
      validations: {
        bindingSourceType: ['manual'],
      },
    },
  };
