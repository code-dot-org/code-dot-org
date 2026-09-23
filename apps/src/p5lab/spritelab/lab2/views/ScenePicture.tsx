import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useState} from 'react';

interface ScenePictureProps {
  src: string | undefined;
  /** Sizes the tile; the picture fills it. */
  className: string;
}

/**
 * A scene's picture, or a blank tile until it has one. A picture that fails
 * to load (an asset since deleted) shows the blank tile too.
 */
const ScenePicture: React.FunctionComponent<ScenePictureProps> = ({
  src,
  className,
}) => {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={className}>
      {src && failed !== src ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        <FontAwesomeV6Icon iconName="image" iconStyle="regular" />
      )}
    </span>
  );
};

export default ScenePicture;
