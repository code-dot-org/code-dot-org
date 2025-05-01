// Creates a definition for the Video component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const VideoContentfulComponentDefinition: ComponentDefinition = {
  id: 'video',
  name: 'Video',
  category: '03: Basic',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/34JWsHE14EP6EoqJyoa3vI/516d08ada4c866195d86bc668fcaf458/component_video_thumbnail.png',
  tooltip: {
    description:
      'Add a video frame to your layout. Supports title, download, and fallback options.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/7I4Hd4Mf5rwUWgm8QfM1nu/1bdbedc97c9e2960a5444d23e0aabc20/component_video_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
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
    videoDesc: {
      displayName: 'Description',
      type: 'Text',
      group: 'content',
      description: 'The description of the video. Helpful for SEO.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    uploadDate: {
      displayName: 'Published Date',
      type: 'Date',
      group: 'content',
      description: 'The upload date of the video. Required for SEO.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    youTubeId: {
      displayName: 'YouTube ID',
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
    showCaption: {
      displayName: 'Show video caption',
      type: 'Boolean',
      defaultValue: true,
      group: 'style',
      description:
        'Check this to show a caption (video title) under the video player.',
    },
  },
};
