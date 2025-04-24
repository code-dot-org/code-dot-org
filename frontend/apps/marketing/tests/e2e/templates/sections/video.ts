import {Section} from './section';

class VideoSection extends Section {
  constructor() {
    super('Video');
  }

  createChildren() {
    this.createHeading({
      heading: 'Without fallback',
      visualAppearance: 'heading-xl',
    });

    this.createVideo({
      videoTitle: 'Video without Fallback',
      videoDesc: 'Video without Fallback Description',
      uploadDate: '2023-10-01',
      youTubeId: 'nKIu9yen5nc',
    });

    this.createHeading({
      heading: 'With fallback',
      visualAppearance: 'heading-xl',
    });

    this.createVideo({
      videoTitle: 'Video with Fallback',
      videoDesc: 'Video with Fallback Description',
      uploadDate: '2023-10-02',
      youTubeId: 'nKIu9yen5nc',
      videoFallback:
        'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
      showCaption: true,
    });
  }
}

export default VideoSection;
