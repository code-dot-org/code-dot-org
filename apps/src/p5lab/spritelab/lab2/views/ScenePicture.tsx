import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useState} from 'react';

interface ScenePictureProps {
  src: string | undefined;
  /** Sizes the tile; the picture fills it. */
  className: string;
  /** Without a picture, the tile is empty rather than showing an icon. */
  blank?: boolean;
}

/**
 * A scene's picture, or an icon (or nothing) until it has one. A picture
 * that fails to load (an asset since deleted) counts as none.
 */
const ScenePicture: React.FunctionComponent<ScenePictureProps> = ({
  src,
  className,
  blank = false,
}) => {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={className}>
      {src && failed !== src ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        !blank && <FontAwesomeV6Icon iconName="image" iconStyle="regular" />
      )}
    </span>
  );
};

export default ScenePicture;
