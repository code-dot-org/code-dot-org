import {Dialog} from '@code-dot-org/component-library/dialog';
import React from 'react';

interface DemoSectionStalenessDialogProps {
  // Stops the onboarding tour entirely.
  onCancel: () => void;
  // Resets the course assignment and continues with the tour.
  onReset: () => void;
}

// Blocking dialog shown when a demo section has drifted from its preset
// curriculum. The teacher must resolve it before the onboarding tutorials can
// proceed: cancel abandons onboarding, reset realigns the course assignment.
const DemoSectionStalenessDialog: React.FC<DemoSectionStalenessDialogProps> = ({
  onCancel,
  onReset,
}) => (
  <Dialog
    title="Your onboarding experience is just one step away"
    description="To use the onboarding experience, your practice class needs to have the default course assigned. Reset the course assignment to use the onboarding experience."
    onClose={onCancel}
    secondaryButtonProps={{
      children: 'Cancel',
      onClick: onCancel,
    }}
    primaryButtonProps={{
      children: 'Reset course assignment',
      onClick: onReset,
    }}
  />
);

export default DemoSectionStalenessDialog;
