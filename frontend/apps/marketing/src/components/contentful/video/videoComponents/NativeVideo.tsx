import ReactPlayer from 'react-player/file';

import type {VideoProps} from './types';

interface NativeVideoProps extends VideoProps {
  posterThumbnail: string;
  src?: string;
  onError: (error: Error) => void;
}

const NativeVideo = ({
  videoTitle,
  posterThumbnail,
  onError,
  src,
}: NativeVideoProps) => {
  return (
    <ReactPlayer
      url={src}
      onError={onError}
      playing={true}
      controls={true}
      height={'100%'}
      width={'100%'}
      config={{
        attributes: {videoTitle, poster: posterThumbnail, title: videoTitle},
      }}
    />
  );
};

export default NativeVideo;
