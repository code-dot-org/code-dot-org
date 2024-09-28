import React, {useCallback} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import moduleStyles from './preview-controls.module.scss';

/**
 * Set of controls for previewing sounds in various custom Music Lab block fields
 */
const PreviewControls: React.FunctionComponent<
  PreviewButtonProps & ClearButtonProps
> = props => (
  <div className={moduleStyles.controlsRow}>
    <PreviewButton {...props} />
    <ClearButton {...props} />
  </div>
);

interface ClearButtonProps {
  onClickClear: () => void;
  cancelPreviews: () => void;
}

const ClearButton: React.FunctionComponent<ClearButtonProps> = ({
  onClickClear,
  cancelPreviews,
}) => {
  const onClick = useCallback(() => {
    cancelPreviews();
    onClickClear();
  }, [cancelPreviews, onClickClear]);
  return (
    <Button
      onClick={onClick}
      isIconOnly={true}
      icon={{iconName: 'ban'}}
      size="s"
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
      onClick={onClick}
      isIconOnly={true}
      icon={{iconName: isPlayingPreview ? 'stop' : 'play'}}
      size="s"
      disabled={!enabled}
    />
  );
};

export default PreviewControls;
