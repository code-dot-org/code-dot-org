// Demo-only control panel for the lesson flow, opened from the gear in
// the student header.  Lets a presenter try variants without touching
// authored lesson content; settings persist per-browser (demoSettings).

import {useTheme, Theme} from '@code-dot-org/component-library/common/contexts';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import React from 'react';

import {
  ADAPTIVITY_INFO,
  applyDemoTheme,
  loadDemoSettings,
  saveDemoSettings,
} from './demoSettings';
import {Link} from './router';
import {ADAPTIVITY_ORDER, AdaptivityMode} from './types';

import styles from './aiLessons.module.scss';

const THEME_OPTIONS: {value: Theme; label: string; icon: string}[] = [
  {value: 'Light', label: 'Light', icon: 'sun'},
  {value: 'Dark', label: 'Dark', icon: 'moon'},
];

// Demo-only step navigation, provided by StudentPage.  Real students
// never see step numbers — positions are misleading once generated steps
// are merged in — so this lives here instead of the lesson view.
export interface StepControl {
  steps: {id: string; title: string}[];
  currentIndex: number;
  canPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (stepId: string) => void;
}

// Adaptivity switching, provided by StudentPage.  The mode is resolved
// from the URL once at mount, and a mid-run switch would half-apply
// anyway (generated steps persist; the full-mode arc boundary is a
// one-shot at the diagnostic) — so switching clears progress and
// reloads at the new URL.
export interface AdaptivityControl {
  current: AdaptivityMode;
  max: AdaptivityMode;
  onSwitch: (mode: AdaptivityMode) => Promise<void>;
}

const DemoSettingsDialog: React.FunctionComponent<{
  onClose: () => void;
  stepControl?: StepControl;
  adaptivityControl?: AdaptivityControl;
  // Wipe saved progress/code for this lesson and reload it from step 1.
  // The page never comes back from this — the caller reloads.
  onRestart?: () => Promise<void>;
}> = ({onClose, stepControl, adaptivityControl, onRestart}) => {
  const {theme, setTheme} = useTheme();
  const [restarting, setRestarting] = React.useState(false);

  const pickTheme = (next: Theme) => {
    applyDemoTheme(next, setTheme);
    saveDemoSettings({...loadDemoSettings(), theme: next});
  };

  return (
    <CustomDialog
      mode={theme === 'Dark' ? 'dark' : 'light'}
      onClose={onClose}
      aria-label="Controls"
      className={styles.demoSettingsDialog}
    >
      <h2 className={styles.demoSettingsTitle}>Controls</h2>
      <p id="dsco-dialog-description" className={styles.muted}>
        Presenter controls for trying lesson-flow variants. These apply to this
        browser only — nothing here changes the lesson or student data.
      </p>
      <div className={styles.demoSettingsSection}>
        <strong>Theme</strong>
        <div className={styles.demoSettingsRow}>
          {THEME_OPTIONS.map(o => (
            <MuiButton
              key={o.value}
              type="button"
              size="small"
              color="primary"
              variant={theme === o.value ? 'contained' : 'outlined'}
              aria-pressed={theme === o.value}
              startIcon={
                <FontAwesomeV6Icon iconName={o.icon} iconStyle="solid" />
              }
              onClick={() => pickTheme(o.value)}
            >
              {o.label}
            </MuiButton>
          ))}
        </div>
      </div>
      {stepControl && (
        <div className={styles.demoSettingsSection}>
          <strong>Go to step</strong>
          <div className={styles.demoSettingsStepRow}>
            <MuiIconButton
              size="small"
              color="primary"
              className={styles.stepArrow}
              disabled={!stepControl.canPrev}
              aria-label="Previous step"
              title="Demo: jump back one step"
              onClick={() => {
                stepControl.onPrev();
                onClose();
              }}
            >
              <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
            </MuiIconButton>
            <span className={styles.demoSettingsStepLabel}>
              <SimpleDropdown
                name="demo-goto-step"
                labelText="Go to step"
                isLabelVisible={false}
                size="s"
                color="black"
                items={stepControl.steps.map((s, i) => ({
                  value: s.id,
                  text: `${i + 1}. ${s.title}`,
                }))}
                selectedValue={
                  stepControl.steps[stepControl.currentIndex]?.id ?? ''
                }
                onChange={e => {
                  stepControl.onGoTo(e.target.value);
                  onClose();
                }}
              />
            </span>
            <MuiIconButton
              size="small"
              color="primary"
              className={styles.stepArrow}
              aria-label="Next step"
              title="Demo: skips the tutor check; authored order, so no hub loops"
              onClick={() => {
                stepControl.onNext();
                onClose();
              }}
            >
              <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
            </MuiIconButton>
          </div>
        </div>
      )}
      {adaptivityControl && (
        <div className={styles.demoSettingsSection}>
          <strong>Adaptivity</strong>
          <div className={styles.adaptivityPills}>
            {ADAPTIVITY_ORDER.map(mode => {
              const info = ADAPTIVITY_INFO[mode];
              const beyondMax =
                ADAPTIVITY_ORDER.indexOf(mode) >
                ADAPTIVITY_ORDER.indexOf(adaptivityControl.max);
              const isCurrent = mode === adaptivityControl.current;
              if (beyondMax) {
                return (
                  <span
                    key={mode}
                    className={styles.adaptivityPillDisabled}
                    title={`${info.blurb} Not enabled for this lesson.`}
                  >
                    {info.label}
                  </span>
                );
              }
              return (
                <button
                  key={mode}
                  type="button"
                  className={
                    isCurrent
                      ? styles.adaptivityPillDefault
                      : styles.adaptivityPill
                  }
                  aria-pressed={isCurrent}
                  disabled={restarting}
                  title={info.blurb}
                  onClick={async () => {
                    if (isCurrent) return;
                    if (
                      !window.confirm(
                        `Switch to "${info.label}"? This clears saved progress and code for this lesson and restarts it from step 1.`
                      )
                    ) {
                      return;
                    }
                    setRestarting(true);
                    await adaptivityControl.onSwitch(mode);
                    // Only reached when the switch failed (success
                    // reloads the page): re-arm the buttons.
                    setRestarting(false);
                  }}
                >
                  {info.label}
                  {isCurrent && (
                    <span className={styles.adaptivityDefaultTag}>current</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className={styles.muted}>
            Switching modes clears progress and restarts the lesson.
          </p>
        </div>
      )}
      {onRestart && (
        <div className={styles.demoSettingsSection}>
          <strong>Replay</strong>
          <div className={styles.demoSettingsRow}>
            <MuiButton
              type="button"
              size="small"
              color="secondary"
              variant="outlined"
              disabled={restarting}
              startIcon={
                <FontAwesomeV6Icon iconName="arrows-rotate" iconStyle="solid" />
              }
              title="Wipes saved code + progress for this lesson and starts over"
              onClick={async () => {
                if (
                  !window.confirm(
                    'Clear all saved progress and code for this lesson and restart from step 1?'
                  )
                ) {
                  return;
                }
                setRestarting(true);
                await onRestart();
                // Only reached when the restart failed (success reloads
                // the page): re-arm the button.
                setRestarting(false);
              }}
            >
              {restarting ? 'Restarting…' : 'Clear progress and restart'}
            </MuiButton>
          </div>
        </div>
      )}
      <div className={styles.demoSettingsFooter}>
        <MuiButton
          component={Link}
          href="/ai_lessons"
          size="small"
          color="primary"
          variant="outlined"
          startIcon={
            <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
          }
        >
          Back to Lessons
        </MuiButton>
      </div>
    </CustomDialog>
  );
};

export default DemoSettingsDialog;
