import React from 'react';

const classNames = require('classnames');
const FontAwesome = require('../../templates/FontAwesome');
const moduleStyles = require('./preview-controls.module.scss').default;

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
  cancelPreviews
}) => (
  <FontAwesome
    icon={'trash-o'}
    onClick={() => {
      cancelPreviews();
      onClickClear();
    }}
    className={moduleStyles.previewButton}
  />
);

interface PreviewButtonProps {
  enabled: boolean;
  playPreview: () => void;
}

const PreviewButton: React.FunctionComponent<PreviewButtonProps> = ({
  enabled,
  playPreview
}) => {
  return (
    <FontAwesome
      icon={'volume-up'}
      onClick={playPreview}
      className={classNames(
        moduleStyles.previewButton,
        !enabled && moduleStyles.previewButtonDisabled
      )}
    />
  );
};

export default PreviewControls;
