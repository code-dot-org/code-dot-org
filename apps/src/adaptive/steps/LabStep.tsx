import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import FakeWebLab from '../FakeWebLab';
import {CapabilityState} from '../progress';
import PromptBox from '../PromptBox';
import {LabStep as LabStepContent} from '../types';

import moduleStyles from '../pathway.module.scss';

interface LabStepProps {
  step: LabStepContent;
  capabilities: CapabilityState;
  continueLabel: string;
  onComplete: () => void;
}

/** The unlock hint for a lab feature, or undefined when it is available. */
export function lockMessage(
  capabilities: CapabilityState,
  grant: keyof CapabilityState,
  feature: string
): string | undefined {
  const state = capabilities[grant];
  if (!state || state.unlocked) return undefined;
  return state.unlockedBy
    ? `${feature} unlocks when you complete ${state.unlockedBy}.`
    : `${feature} is locked.`;
}

const LabStep: React.FunctionComponent<LabStepProps> = ({
  step,
  capabilities,
  continueLabel,
  onComplete,
}) => {
  const project = step.sourceMode === 'project';

  return (
    <div className={moduleStyles.lab}>
      <aside className={moduleStyles.instructions}>
        <div className={moduleStyles.instructionsBody}>
          <MuiTypography variant="overline3">
            {project ? 'Your project' : 'Sandbox'}
          </MuiTypography>
          <SafeMarkdown markdown={step.instructions} />
        </div>
        <div className={moduleStyles.instructionsFooter}>
          <PromptBox
            locked={lockMessage(
              capabilities,
              'aiPrompt',
              'The AI code builder'
            )}
          />
          <div className={moduleStyles.footerButtons}>
            <MuiButton variant="outlined" disabled>
              Submit
            </MuiButton>
            <MuiButton variant="contained" onClick={onComplete}>
              {continueLabel}
            </MuiButton>
          </div>
        </div>
      </aside>
      <FakeWebLab
        files={step.lab.starterFiles}
        viewMode={step.lab.initialViewMode}
        label={project ? 'Your project' : undefined}
        codeLocked={lockMessage(capabilities, 'htmlEditing', 'HTML editing')}
      />
    </div>
  );
};

export default LabStep;
