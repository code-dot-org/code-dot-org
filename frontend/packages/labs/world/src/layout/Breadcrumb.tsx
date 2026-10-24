// The breadcrumb over the editor: the trail from the Main Screen to what is
// open, each step a way back to it (specs/SHELL_PLAN.md, step 1). It stands
// where the file tabs stood.

import {Button, Typography} from '@mui/material';
import {Fragment} from 'react';

import {useCodebridgeConfig} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

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
   * tab was (`config.fileLabel`), a placement by its own name, and the
   * Screen's or Map's own code as Code.
   */
  const nameOf = (step: TrailStep): string => {
    if (step.script) {
      return step.script.kind === 'placement' ? step.script.id : 'Code';
    }
    const file = currentSources.source.files[step.fileId];
    return file ? (config.fileLabel?.(file) ?? file.name) : '';
  };

  const last = trail.trail.length - 1;
  return (
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
  );
};
