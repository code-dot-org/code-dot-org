import classNames from 'classnames';
import React, {useCallback} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import moduleStyles from './preview-controls.module.scss';

/**
 * Updated version of {@link PreviewControls} that uses the new Button component
 */
const PreviewControlsV2: React.FunctionComponent<
  PreviewButtonProps & ClearButtonProps
> = props => (
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

const ClearButton: React.FunctionComponent<ClearButtonProps> = ({
  enabled,
  onClickClear,
  cancelPreviews,
}) => {
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

const PreviewButton: React.FunctionComponent<PreviewButtonProps> = ({
  enabled,
  playPreview,
  cancelPreviews,
  isPlayingPreview,
}) => {
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
