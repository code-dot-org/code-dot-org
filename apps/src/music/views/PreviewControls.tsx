import React, {useCallback} from 'react';
import classNames from 'classnames';

import FontAwesome from '../../templates/FontAwesome';
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
    <button
      className={moduleStyles.buttonContainer}
      onClick={onClick}
      type="button"
    >
      <FontAwesome
        icon={'trash-o'}
        className={moduleStyles.previewButton}
        title={undefined}
      />
    </button>
  );
};

interface PreviewButtonProps {
  enabled: boolean;
  playPreview: () => void;
}

const PreviewButton: React.FunctionComponent<PreviewButtonProps> = ({
  enabled,
  playPreview,
}) => {
  return (
    <button
      className={moduleStyles.buttonContainer}
      onClick={enabled ? playPreview : undefined}
      type="button"
    >
      <FontAwesome
        icon={'play-circle'}
        className={classNames(
          moduleStyles.previewButton,
          !enabled && moduleStyles.previewButtonDisabled
        )}
        title={undefined}
      />
    </button>
  );
};

export default PreviewControls;
