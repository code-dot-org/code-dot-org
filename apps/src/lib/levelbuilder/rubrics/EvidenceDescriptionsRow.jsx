import React from 'react';
import PropTypes from 'prop-types';

export default function EvidenceDescriptionsRow({isAiEnabled, evidenceLabel}) {
  return (
    <div style={styles.grid}>
      <label style={styles.gridLabels}>{evidenceLabel}</label>
      <textarea style={styles.textareaBoxes} />
      <textarea
        className={'ui-test-ai-prompt-textbox'}
        style={styles.textareaBoxes}
        disabled={!isAiEnabled}
        required={isAiEnabled}
      />
    </div>
  );
}

EvidenceDescriptionsRow.propTypes = {
  isAiEnabled: PropTypes.bool,
  evidenceLabel: PropTypes.string,
};

const styles = {
  textareaBoxes: {
    width: '90%',
    height: '80px',
    resize: 'none',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  gridLabels: {
    verticalAlign: 'middle',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 1fr',
    gap: '10px',
  },
};
