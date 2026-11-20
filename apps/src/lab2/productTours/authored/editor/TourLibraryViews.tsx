import {DropdownProviderWrapper} from '@code-dot-org/component-library/common/contexts';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {Button, IconButton, Typography} from '@mui/material';
import React from 'react';

import {AuthoredTour, TourReference, TourUsageLevel} from '../types';

import styles from './authored-tour-editor.module.scss';

export const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const tourName = (tour: AuthoredTour) => tour.name || 'Untitled tour';

export const tourSummary = (tour: AuthoredTour, usageCount: number) =>
  `${plural(tour.steps.length, 'step')} • ${
    usageCount ? `Used in ${plural(usageCount, 'level')}` : 'Not on any level'
  }`;

interface OverflowMenuProps {
  name: string;
  label: string;
  options: ActionDropdownOption[];
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({
  name,
  label,
  options,
}) => (
  <DropdownProviderWrapper>
    <ActionDropdown
      name={name}
      labelText={label}
      size="xs"
      menuPlacement="right"
      options={options}
      triggerButtonProps={{
        variant: 'text',
        color: 'tertiary',
        'aria-label': label,
        children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
      }}
    />
  </DropdownProviderWrapper>
);

interface LevelToursViewProps {
  library: AuthoredTour[];
  references: TourReference[];
  usageCount: (tourId: string) => number;
  onOpenTour: (tourId: string) => void;
  onPlay: (tourId: string) => void;
  onEdit: (tourId: string) => void;
  onDuplicate: (tourId: string) => void;
  onSetAutoStart: (tourId: string, autoStart: boolean) => void;
  onRemove: (tourId: string) => void;
  onBrowseLibrary: () => void;
}

// The library tours this level uses.
export const LevelToursView: React.FC<LevelToursViewProps> = ({
  library,
  references,
  usageCount,
  onOpenTour,
  onPlay,
  onEdit,
  onDuplicate,
  onSetAutoStart,
  onRemove,
  onBrowseLibrary,
}) => {
  if (references.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <FontAwesomeV6Icon iconName="compass" />
        </span>
        <Typography variant="body2" component="p" className={styles.emptyTitle}>
          No tours on this level
        </Typography>
        <Typography variant="body4" component="p" className={styles.hint}>
          Add an existing tour from the library or create a new one.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="extraSmall"
          startIcon={<FontAwesomeV6Icon iconName="plus" aria-hidden="true" />}
          onClick={onBrowseLibrary}
        >
          Add from library
        </Button>
      </div>
    );
  }
  return (
    <ul className={styles.list}>
      {references.map(reference => {
        const tour = library.find(candidate => candidate.id === reference.id);
        if (!tour) {
          return (
            <li key={reference.id} className={styles.tourCard}>
              <div className={styles.tourCardText}>
                <Typography variant="body3" component="span">
                  {reference.id}
                </Typography>
                <Typography variant="body4" className={styles.warning}>
                  Missing from the library. Students will not see it.
                </Typography>
              </div>
              <IconButton
                size="extraSmall"
                variant="text"
                color="tertiary"
                aria-label="Remove from level"
                onClick={() => onRemove(reference.id)}
              >
                <FontAwesomeV6Icon iconName="xmark" />
              </IconButton>
            </li>
          );
        }
        const summary = tourSummary(tour, usageCount(tour.id));
        return (
          <li key={tour.id} className={styles.tourCard}>
            <button
              type="button"
              className={styles.tourCardText}
              onClick={() => onOpenTour(tour.id)}
            >
              <Typography variant="body3" component="span">
                <strong>{tourName(tour)}</strong>
              </Typography>
              <Typography
                variant="body4"
                component="span"
                className={styles.rowDetail}
              >
                {reference.autoStart
                  ? `${summary} • Starts automatically`
                  : summary}
              </Typography>
            </button>
            <div className={styles.tourCardActions}>
              <IconButton
                size="extraSmall"
                variant="outlined"
                color="tertiary"
                aria-label={`Play ${tourName(tour)}`}
                disabled={tour.steps.length === 0}
                onClick={() => onPlay(tour.id)}
              >
                <FontAwesomeV6Icon iconName="play" />
              </IconButton>
              <OverflowMenu
                name={`level-tour-${tour.id}`}
                label={`${tourName(tour)} options`}
                options={[
                  {
                    value: 'edit',
                    label: 'Edit tour',
                    icon: {iconName: 'pencil'},
                    onClick: () => onEdit(tour.id),
                  },
                  {
                    value: 'duplicate',
                    label: 'Duplicate tour',
                    icon: {iconName: 'copy'},
                    onClick: () => onDuplicate(tour.id),
                  },
                  {
                    value: 'auto-start',
                    label: reference.autoStart
                      ? "Don't start automatically"
                      : 'Start automatically',
                    icon: {iconName: 'circle-play'},
                    onClick: () =>
                      onSetAutoStart(tour.id, !reference.autoStart),
                  },
                  {
                    value: 'remove',
                    label: 'Remove from level',
                    icon: {iconName: 'xmark'},
                    isOptionDestructive: true,
                    onClick: () => onRemove(tour.id),
                  },
                ]}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

interface LibraryViewProps {
  library: AuthoredTour[];
  usageCount: (tourId: string) => number;
  onOpenTour: (tourId: string) => void;
}

// Every tour of the lab.
export const LibraryView: React.FC<LibraryViewProps> = ({
  library,
  usageCount,
  onOpenTour,
}) =>
  library.length === 0 ? (
    <Typography variant="body3" className={styles.hint}>
      This lab has no tours yet.
    </Typography>
  ) : (
    <ul className={styles.list}>
      {library.map(tour => (
        <li key={tour.id}>
          <button
            type="button"
            className={styles.cardButton}
            onClick={() => onOpenTour(tour.id)}
          >
            <span className={styles.cardButtonText}>
              <Typography variant="body3" component="span">
                <strong>{tourName(tour)}</strong>
              </Typography>
              <Typography
                variant="body4"
                component="span"
                className={styles.rowDetail}
              >
                {tourSummary(tour, usageCount(tour.id))}
              </Typography>
            </span>
            <FontAwesomeV6Icon iconName="chevron-right" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );

interface TourViewProps {
  tour: AuthoredTour;
  usedOn: TourUsageLevel[];
  currentLevelId: number;
  isEditing: boolean;
  onRename: (name: string) => void;
  onOpenStep: (stepId: string) => void;
  onAddStep: () => void;
}

// One tour as a timeline of its steps. Read-only unless the author has chosen
// to edit it.
export const TourView: React.FC<TourViewProps> = ({
  tour,
  usedOn,
  currentLevelId,
  isEditing,
  onRename,
  onOpenStep,
  onAddStep,
}) => (
  <>
    {isEditing ? (
      <TextField
        name="tour-name"
        label="Tour name"
        value={tour.name}
        onChange={event => onRename(event.target.value)}
        helperMessage="Students see this name in the resource panel."
        size="s"
      />
    ) : (
      <div className={styles.tourHeading}>
        <Typography variant="body3" component="h3">
          <strong>{tourName(tour)}</strong>
        </Typography>
        <Typography variant="body4" className={styles.rowDetail}>
          <FontAwesomeV6Icon iconName="route" aria-hidden="true" />{' '}
          {plural(tour.steps.length, 'step')}
        </Typography>
      </div>
    )}

    {tour.steps.length === 0 ? (
      <Typography variant="body3" className={styles.hint}>
        {isEditing
          ? 'No steps yet. Add one, then pick the part of the lab it points at.'
          : 'This tour has no steps yet.'}
      </Typography>
    ) : (
      <ol className={styles.timeline}>
        {tour.steps.map((step, index) => (
          <li key={step.id} className={styles.timelineItem}>
            <button
              type="button"
              className={styles.cardButton}
              onClick={() => onOpenStep(step.id)}
            >
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.cardButtonText}>
                <Typography variant="body3" component="span">
                  <strong>{step.title || 'Untitled step'}</strong>
                </Typography>
                <Typography
                  variant="body4"
                  component="span"
                  className={styles.rowDetail}
                >
                  {step.anchorLabel ?? step.anchor ?? 'Middle of the page'}
                </Typography>
              </span>
              <FontAwesomeV6Icon iconName="chevron-right" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    )}
    {isEditing && (
      <div className={styles.buttonRow}>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<FontAwesomeV6Icon iconName="plus" aria-hidden="true" />}
          onClick={onAddStep}
        >
          Add step
        </Button>
      </div>
    )}

    {usedOn.length > 0 && (
      <section className={styles.usedOn}>
        <Typography component="h3" variant="overline3">
          {`Used in ${plural(usedOn.length, 'level')}`}
        </Typography>
        <ul className={styles.usedOnList}>
          {usedOn.map(level => (
            <li key={level.id}>
              {level.id === currentLevelId ? (
                <Typography variant="body3" component="span">
                  {`${level.label} (this level)`}
                </Typography>
              ) : (
                <Link
                  href={level.url}
                  text={level.label}
                  size="s"
                  external
                  openInNewTab
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    )}
  </>
);
