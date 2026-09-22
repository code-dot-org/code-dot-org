import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import FakeWebLab from './FakeWebLab';
import {CapabilityState, CheckpointStatus, ProjectMeta} from './progress';
import PromptBox from './PromptBox';
import {lockMessage} from './steps/LabStep';
import {Pathway} from './types';
import UnlockHint from './UnlockHint';

import moduleStyles from './pathway.module.scss';

interface ProjectViewProps {
  pathway: Pathway;
  statuses: {[id: string]: CheckpointStatus};
  project: ProjectMeta;
  capabilities: CapabilityState;
  onExit: () => void;
  onSelectCheckpoint: (id: string) => void;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  pathway,
  statuses,
  project,
  capabilities,
  onExit,
  onSelectCheckpoint,
}) => {
  const unlocked = new Set(
    pathway.checkpoints
      .filter(c => statuses[c.id] === 'complete')
      .flatMap(c => c.unlocks || [])
  );
  const abilities = Object.values(pathway.abilities);

  return (
    <div className={moduleStyles.player}>
      <div className={moduleStyles.playerBar}>
        <MuiButton variant="text" size="small" onClick={onExit}>
          <FontAwesomeV6Icon iconName="arrow-left" />
          &nbsp;Back to map
        </MuiButton>
        <div className={moduleStyles.playerBarTitle}>
          <MuiTypography variant="overline3">My Project</MuiTypography>
          <MuiTypography variant="strong">{project.title}</MuiTypography>
        </div>
      </div>
      <div className={moduleStyles.playerBody}>
        <div className={moduleStyles.lab}>
          <aside className={moduleStyles.instructions}>
            <div className={moduleStyles.instructionsBody}>
              <MuiTypography variant="h5">
                Take your skills into the real world
              </MuiTypography>
              <MuiTypography variant="body3">
                {project.description}
              </MuiTypography>
              <MuiTypography variant="strong">Tools Available</MuiTypography>
              <ul className={moduleStyles.plainList}>
                {abilities.map(a => {
                  const on = unlocked.has(a.id);
                  return (
                    <li key={a.id} className={moduleStyles.abilityItem}>
                      <span
                        className={classNames(
                          moduleStyles.abilityIcon,
                          on
                            ? moduleStyles.abilityIconUnlocked
                            : moduleStyles.abilityIconLocked
                        )}
                      >
                        <FontAwesomeV6Icon
                          iconName={on ? a.icon || 'unlock' : 'lock'}
                        />
                      </span>
                      <MuiTypography variant="body3">
                        <strong>{a.title}</strong>
                        <br />
                        <span className={moduleStyles.muted}>
                          {on ? (
                            a.description
                          ) : (
                            <UnlockHint
                              pathway={pathway}
                              abilityId={a.id}
                              onSelectCheckpoint={onSelectCheckpoint}
                            />
                          )}
                        </span>
                      </MuiTypography>
                    </li>
                  );
                })}
              </ul>
              <MuiTypography variant="body4" className={moduleStyles.muted}>
                Work freely. Anything you build here stays with your project.
                Unlock more checkpoints on the map to add to it.
              </MuiTypography>
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
              </div>
            </div>
          </aside>
          <FakeWebLab
            viewMode="split"
            label={project.title}
            codeLocked={lockMessage(
              capabilities,
              'htmlEditing',
              'HTML editing'
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
