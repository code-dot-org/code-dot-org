import '@code-dot-org/component-library/carousel/index.css';
import {Carousel} from '@code-dot-org/component-library/carousel';
import React, {ReactNode} from 'react';

type VideoCarouselProps = {
  /** Carousel content */
  children: {id: string; child: ReactNode}[];
};

const VideoCarousel: React.FC<VideoCarouselProps> = ({children}) => {
  return (
    <Carousel
      slides={children.map(child => ({id: child.id, slide: child.child}))}
      className={''}
    />
  );
};

export default VideoCarousel;
