import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {TOUR_WELCOME} from './freeplayTour';
import {FreeplayTour} from './useFreeplayTour';

import moduleStyles from './sprite-lab2-view.module.scss';

// The tour holds focus and takes every click, so it reads as a modal.
const dialogProps = {
  role: 'dialog',
  'aria-modal': true,
  'aria-label': 'Welcome tour',
} as const;

/** What the guide shows while the freeplay tour runs. */
const FreeplayTourGuide: React.FunctionComponent<{tour: FreeplayTour}> = ({
  tour,
}) => {
  if (tour.variant === 'steps') {
    return (
      <div className={moduleStyles.tourGuide} {...dialogProps}>
        <p className={moduleStyles.tourText}>{tour.current?.text}</p>
        <div className={moduleStyles.tourActions}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={tour.isLast ? tour.done : tour.next}
          >
            {tour.isLast ? 'Done' : 'Next'}
          </MuiButton>
        </div>
      </div>
    );
  }
  return (
    <div className={moduleStyles.tourGuide} {...dialogProps}>
      <p className={moduleStyles.tourText}>{TOUR_WELCOME}</p>
      <ul className={moduleStyles.tourList}>
        {tour.lines.map(step => (
          <li key={step.id}>
            <button
              type="button"
              className={classNames(
                moduleStyles.tourLine,
                tour.current?.id === step.id && moduleStyles.tourLineActive
              )}
              aria-pressed={tour.current?.id === step.id}
              onClick={() => tour.show(step.id)}
            >
              {step.text}
            </button>
          </li>
        ))}
      </ul>
      <div className={moduleStyles.tourActions}>
        <MuiButton
          variant="outlined"
          color="secondary"
          size="small"
          onClick={tour.done}
        >
          Done
        </MuiButton>
      </div>
    </div>
  );
};

export default FreeplayTourGuide;
