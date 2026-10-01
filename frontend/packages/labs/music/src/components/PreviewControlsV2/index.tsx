import classNames from 'classnames';
import {useCallback} from 'react';

import Button from '@code-dot-org/component-library/button';

import moduleStyles from './preview-controls.module.scss';

/**
 * Updated version of {@link PreviewControls} that uses the new Button component
 */
const PreviewControlsV2 = ({
  ...props
}: PreviewButtonProps & ClearButtonProps) => (
  <div className={classNames(moduleStyles.controlsRow, moduleStyles.v2)}>
    <PreviewButton {...props} />
    <ClearButton {...props} />
  </div>
);

interface ClearButtonProps {
  enabled: boolean;
  onClickClear: () => void;
  cancelPreviews: () => void;
}

const ClearButton = ({
  enabled,
  onClickClear,
  cancelPreviews,
}: ClearButtonProps) => {
  const onClick = useCallback(() => {
    cancelPreviews();
    onClickClear();
  }, [cancelPreviews, onClickClear]);
  return (
    <Button
      color={'white'}
      type="secondary"
      onClick={onClick}
      isIconOnly={true}
      icon={{iconName: 'ban'}}
      size="s"
      disabled={!enabled}
    />
  );
};

interface PreviewButtonProps {
  enabled: boolean;
  playPreview: () => void;
  cancelPreviews: () => void;
  isPlayingPreview: boolean;
}

const PreviewButton = ({
  enabled,
  playPreview,
  cancelPreviews,
  isPlayingPreview,
}: PreviewButtonProps) => {
  const onClick = useCallback(() => {
    if (isPlayingPreview) {
      cancelPreviews();
    } else {
      playPreview();
    }
  }, [cancelPreviews, isPlayingPreview, playPreview]);

  return (
    <Button
      color={'white'}
      type="secondary"
      onClick={onClick}
      isIconOnly={true}
      icon={{iconName: isPlayingPreview ? 'stop' : 'play'}}
      size="s"
      disabled={!enabled}
    />
  );
};

export default PreviewControlsV2;
