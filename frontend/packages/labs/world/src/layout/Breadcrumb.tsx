// The breadcrumb over the editor: the trail from the Main Screen to what is
// open, each step a way back to it (specs/SHELL_PLAN.md, step 1). It stands
// where the file tabs stood.

import {Button, Typography} from '@mui/material';
import {Fragment} from 'react';

import {useCodebridgeConfig} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {actorDataOf, memberName} from '../actors/actorData';
import {actorStepAt} from '../actors/actorSteps';
import {actorTweenAt} from '../actors/actorTweens';
import {ruleDataOf} from '../rules/ruleEdits';
import {ruleMemberName} from '../rules/ruleMembers';
import {stepAtOf, stepOf} from '../rules/ruleSteps';

import styles from './breadcrumb.module.css';
import type {TrailStep} from './trail';
import {useTrail} from './TrailContext';

export const Breadcrumb = () => {
  const trail = useTrail();
  const {currentSources} = useSources<MultiFileSource>();
  const config = useCodebridgeConfig();
  if (!trail?.trail.length) {
    return null;
  }

  /**
   * What a step is called where the rest of the lab names it: a file as its
   * tab was (`config.fileLabel`), a placement or a trait by its own name, and
   * the Screen's or Map's own code as Code.
   */
  const nameOf = (step: TrailStep): string => {
    const file = currentSources.source.files[step.fileId];
    if (step.script?.kind === 'drawing') {
      return 'Drawing';
    }
    if (step.script?.kind === 'tween') {
      const data = actorDataOf(file?.contents ?? '');
      return (
        (data && actorTweenAt(data, step.script.id)?.tween.name) || 'Tween'
      );
    }
    if (step.script?.kind === 'step' && file?.name.endsWith('.actor')) {
      const data = actorDataOf(file.contents ?? '');
      const at = data && actorStepAt(data, step.script.id);
      return (at !== undefined && data?.steps?.[at]?.name) || 'Step';
    }
    if (step.script?.kind === 'step') {
      const data = ruleDataOf(file?.contents ?? '');
      const place = data && stepAtOf(data, step.script.id);
      return (place && stepOf(data, place)?.name) || 'Step';
    }
    if (step.script?.kind === 'member') {
      return file?.name.endsWith('.rule')
        ? ruleMemberName(ruleDataOf(file.contents ?? ''), step.script.id)
        : memberName(file?.contents, step.script.id);
    }
    if (step.script) {
      return step.script.kind === 'placement' || step.script.kind === 'trait'
        ? step.script.id
        : 'Code';
    }
    return file ? (config.fileLabel?.(file) ?? file.name) : '';
  };

  const last = trail.trail.length - 1;
  return (
    <div className={styles.bar}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol className={styles.steps}>
          {trail.trail.map((step, at) => (
            <Fragment key={`${step.fileId}:${at}`}>
              {at > 0 && (
                <li className={styles.separator} aria-hidden>
                  ›
                </li>
              )}
              <li className={styles.step}>
                {at === last ? (
                  <Typography
                    component="span"
                    variant="label2"
                    aria-current="page"
                    className={styles.here}
                  >
                    {nameOf(step)}
                  </Typography>
                ) : (
                  <Button
                    variant="text"
                    size="extraSmall"
                    onClick={() => trail.goTo(at)}
                  >
                    {nameOf(step)}
                  </Button>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      {/* The open page's actions (`TrailActions`). */}
      <div ref={trail.setActionsHost} className={styles.actions} />
    </div>
  );
};
