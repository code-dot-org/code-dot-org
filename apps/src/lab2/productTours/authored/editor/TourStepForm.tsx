import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import {Button, Typography} from '@mui/material';
import {upperFirst} from 'lodash';
import React from 'react';

import {effectiveRequirement} from '../authoredTourSteps';
import {TourEvent} from '../tourEvents';
import {
  AuthoredTourPlacement,
  AuthoredTourRequirement,
  AuthoredTourStep,
} from '../types';

import styles from './authored-tour-editor.module.scss';

const PLACEMENTS: {
  value: AuthoredTourPlacement;
  label: string;
  icon: string;
}[] = [
  {value: 'auto', label: 'Wherever it fits', icon: 'wand-magic-sparkles'},
  {value: 'top', label: 'Above', icon: 'arrow-up'},
  {value: 'bottom', label: 'Below', icon: 'arrow-down'},
  {value: 'left', label: 'To the left', icon: 'arrow-left'},
  {value: 'right', label: 'To the right', icon: 'arrow-right'},
];

const EVENT_PREFIX = 'event:';

const requirementValue = (requirement: AuthoredTourRequirement) =>
  requirement.type === 'event'
    ? `${EVENT_PREFIX}${requirement.event}`
    : requirement.type;

const requirementFromValue = (value: string): AuthoredTourRequirement =>
  value.startsWith(EVENT_PREFIX)
    ? {type: 'event', event: value.slice(EVENT_PREFIX.length)}
    : {type: value === 'click' ? 'click' : 'next'};

interface TourStepFormProps {
  step: AuthoredTourStep;
  isLast: boolean;
  events: TourEvent[];
  readOnly: boolean;
  isPicking: boolean;
  targetMissing: boolean;
  onChange: (step: AuthoredTourStep) => void;
  onPickTarget: () => void;
  onCancelPick: () => void;
}

const TourStepForm: React.FC<TourStepFormProps> = ({
  step,
  isLast,
  events,
  readOnly,
  isPicking,
  targetMissing,
  onChange,
  onPickTarget,
  onCancelPick,
}) => {
  const textId = `tour-step-text-${step.id}`;

  return (
    <>
      <div className={styles.field}>
        <Typography variant="label3" component="span">
          Target
        </Typography>
        <div className={styles.targetBox}>
          <FontAwesomeV6Icon iconName="crosshairs" aria-hidden="true" />
          <Typography variant="body4" component="span">
            <strong>
              {step.anchor
                ? step.anchorLabel ?? step.anchor
                : 'Middle of the page'}
            </strong>
          </Typography>
        </div>
        {targetMissing && !isPicking && (
          <Typography variant="body4" className={styles.helperWarning}>
            <FontAwesomeV6Icon
              iconName="exclamation-circle"
              className={styles.warningIcon}
              aria-hidden="true"
            />
            Target is not currently on-screen.
          </Typography>
        )}
        {!readOnly && (
          <>
            <div className={styles.buttonRow}>
              {isPicking ? (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  onClick={onCancelPick}
                >
                  Cancel picking
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="extraSmall"
                  startIcon={
                    <FontAwesomeV6Icon
                      iconName="arrow-pointer"
                      aria-hidden="true"
                    />
                  }
                  onClick={onPickTarget}
                >
                  {step.anchor ? 'Pick another part' : 'Pick a part of the lab'}
                </Button>
              )}
              {step.anchor && !isPicking && (
                <Button
                  variant="text"
                  color="secondary"
                  size="extraSmall"
                  onClick={() =>
                    onChange({
                      ...step,
                      anchor: undefined,
                      anchorLabel: undefined,
                    })
                  }
                >
                  Clear
                </Button>
              )}
            </div>
            <Typography variant="body4" className={styles.hint}>
              {isPicking
                ? 'Click an outlined part of the lab. Press Esc to cancel.'
                : 'To point inside a menu, open the menu in the lab, then press Option+P (Alt+P).'}
            </Typography>
          </>
        )}
      </div>

      <TextField
        name={`tour-step-title-${step.id}`}
        label="Title"
        value={step.title}
        disabled={readOnly}
        onChange={event => onChange({...step, title: event.target.value})}
        size="s"
      />

      <div className={styles.field}>
        <Typography variant="label3" component="label" htmlFor={textId}>
          Text
        </Typography>
        <textarea
          id={textId}
          className={styles.textArea}
          value={step.text}
          rows={3}
          disabled={readOnly}
          onChange={event => onChange({...step, text: event.target.value})}
        />
      </div>

      <SimpleDropdown
        labelText="To continue, the student"
        name={`tour-step-requirement-${step.id}`}
        items={[
          {value: 'next', text: isLast ? 'Clicks Done' : 'Clicks Next'},
          {
            value: 'click',
            text: 'Clicks the target',
            disabled: !step.anchor,
          },
          ...events.map(event => ({
            value: `${EVENT_PREFIX}${event.name}`,
            text: upperFirst(event.label),
          })),
        ]}
        selectedValue={requirementValue(effectiveRequirement(step))}
        disabled={readOnly}
        onChange={event =>
          onChange({
            ...step,
            requirement: requirementFromValue(event.target.value),
          })
        }
        size="s"
      />

      {step.anchor && (
        <div className={styles.field}>
          <Typography variant="label3" component="span">
            Popover placement
          </Typography>
          <SegmentedButtons
            size="s"
            type="iconOnly"
            buttons={PLACEMENTS.map(placement => ({
              value: placement.value,
              ariaLabel: placement.label,
              icon: {iconName: placement.icon, title: placement.label},
              disabled: readOnly,
            }))}
            selectedButtonValue={step.placement ?? 'auto'}
            onChange={value =>
              onChange({...step, placement: value as AuthoredTourPlacement})
            }
          />
        </div>
      )}
    </>
  );
};

export default TourStepForm;
