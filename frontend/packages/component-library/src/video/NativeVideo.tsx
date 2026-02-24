import {ReactEventHandler} from 'react';
import ReactPlayer from 'react-player';

import type {VideoProps} from '@/video/types';

interface NativeVideoProps extends VideoProps {
  posterThumbnail: string;
  src?: string;
  onError: (error: string | Event) => void;
}

const NativeVideo = ({
  videoTitle,
  posterThumbnail,
  onError,
  src,
}: NativeVideoProps) => {
  return (
    <ReactPlayer
      src={src}
      onError={onError as unknown as ReactEventHandler<HTMLVideoElement>}
      playing={true}
      controls={true}
      height={'100%'}
      width={'100%'}
      config={{
        html: {
          attributes: {videoTitle, poster: posterThumbnail, title: videoTitle},
        },
      }}
    />
  );
};

export default NativeVideo;
