import React from 'react';
import PropTypes from 'prop-types';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import EvidenceDescriptionsRow from './EvidenceDescriptionsRow';

export default function EvidenceDescriptions({isAiEnabled}) {
  return (
    <div>
      <div style={styles.grid}>
        <Heading6 style={styles.columnHeaders}>Evidence level</Heading6>
        <Heading6 style={styles.columnHeaders}>
          Description for external viewers
        </Heading6>
        <Heading6 style={styles.columnHeaders}>
          Description for AI generated evaluation
        </Heading6>
      </div>
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'Extensive Evidence'}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'Convincing Evidence'}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'Limited Evidence'}
      />
      <EvidenceDescriptionsRow
        isAiEnabled={isAiEnabled}
        evidenceLabel={'No Evidence'}
      />
    </div>
  );
}

EvidenceDescriptions.propTypes = {
  isAiEnabled: PropTypes.bool,
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 1fr',
    gap: '10px',
  },
  columnHeaders: {
    textAlign: 'center',
  },
};
