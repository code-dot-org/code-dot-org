import ReactPlayer from 'react-player/youtube';

import Facade from '@/video/Facade';
import PlayButton from '@/video/PlayButton';
import {VideoProps} from '@/video/types';

interface YouTubeVideoProps extends VideoProps {
  src: string;
  posterThumbnail: string;
  onError: (error: Error) => void;
}

const YouTubeVideo = ({
  src,
  onError,
  posterThumbnail,
  videoTitle,
}: YouTubeVideoProps) => {
  const ariaLabel = `Play video ${videoTitle}`;

  return (
    <ReactPlayer
      height={'100%'}
      width={'100%'}
      url={src}
      onError={onError}
      previewTabIndex={-1} // the play icon is the tabbable portion
      light={<Facade posterThumbnail={posterThumbnail} alt={ariaLabel} />}
      playIcon={<PlayButton label={ariaLabel} />}
      controls={true}
      config={{
        playerVars: {autoplay: 1},
      }}
    />
  );
};

export default YouTubeVideo;
