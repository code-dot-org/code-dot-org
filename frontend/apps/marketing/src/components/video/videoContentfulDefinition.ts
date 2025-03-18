// Creates a definition for the Video component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const VideoContentfulComponentDefinition: ComponentDefinition = {
  id: 'video',
  name: 'Video',
  category: 'Custom Components',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/34JWsHE14EP6EoqJyoa3vI/2328840aeb5c98b7483aa50f7ba7dcf0/component_video_thumbnail.png',
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
    },
    youTubeId: {
      displayName: 'YouTube ID',
      type: 'Text',
      group: 'content',
      description:
        'The YouTube ID of the video. This is the unique identifier for the video on YouTube.',
    },
    videoFallback: {
      displayName: 'Video fallback',
      type: 'Text',
      group: 'content',
      description:
        'This is the URL of the video that will be used in place of the YouTube video if YouTube is blocked.',
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
