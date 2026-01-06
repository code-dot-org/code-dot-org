import classNames from 'classnames';
import React, {useCallback} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import moduleStyles from './preview-controls.module.scss';

export interface ClearButtonProps {
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
    <button
      className={moduleStyles.buttonContainer}
      onClick={onClick}
      type="button"
    >
      <FontAwesomeV6Icon
        iconName={'trash-can'}
        className={moduleStyles.previewButton}
      />
    </button>
  );
};

export interface PreviewButtonProps {
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
    <button
      className={moduleStyles.buttonContainer}
      onClick={enabled ? onClick : undefined}
      type="button"
    >
      <FontAwesomeV6Icon
        iconName={isPlayingPreview ? 'stop-circle' : 'play-circle'}
        className={classNames(
          moduleStyles.previewButton,
          !enabled && moduleStyles.previewButtonDisabled,
        )}
      />
    </button>
  );
};

export type PreviewControlsProps = PreviewButtonProps & ClearButtonProps;

/**
 * Set of controls for previewing sounds in various custom Music Lab block fields
 */
const PreviewControls: React.FunctionComponent<
  PreviewControlsProps
> = props => (
  <div className={moduleStyles.controlsRow}>
    <PreviewButton {...props} />
    <ClearButton {...props} />
  </div>
);

export default PreviewControls;
