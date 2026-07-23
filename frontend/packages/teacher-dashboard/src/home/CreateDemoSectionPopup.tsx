import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {LinearProgress} from '@mui/material';
import React from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  createDemoSection,
  DemoSectionCreationError,
  fetchDemoPresets,
} from '../redux/teacherSectionsRedux';
import {DemoPresetView, DemoType} from '../redux/types/teacherSectionTypes';

import styles from './createDemoSectionPopup.module.scss';

const DEMO_TYPE_ORDER: DemoType[] = ['elementary', 'middle', 'high'];

const DEMO_TYPE_TITLES: Record<DemoType, string> = {
  elementary: 'Elementary School',
  middle: 'Middle School',
  high: 'High School',
};
const DEMO_TYPE_ICONS: Record<DemoType, string> = {
  elementary: 'cubes',
  middle: 'laptop-binary',
  high: 'graduation-cap',
};

const LOGIN_TYPE_LABELS: Record<string, string> = {
  picture: 'Picture logins',
  word: 'Secret words',
  email: 'Personal logins',
};

const formatGrades = (grades: string[]): string => {
  if (grades.length === 0) {
    return '';
  }
  if (grades.length === 1) {
    return `Grade ${grades[0]}`;
  }
  return `Grades ${grades[0]}–${grades[grades.length - 1]}`;
};

const curriculumName = (preset: DemoPresetView): string =>
  preset.unitGroup?.displayName ?? preset.unit?.displayName ?? '';

const loginTypeLabel = (loginType: string): string =>
  LOGIN_TYPE_LABELS[loginType] ?? loginType;

interface CreateDemoSectionPopupProps {
  onClose: () => void;
}

export const CreateDemoSectionPopup: React.FC<CreateDemoSectionPopupProps> = ({
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const demoPresets = useAppSelector(
    state => state.teacherSections.demoPresets,
  );
  const creationInProgress = useAppSelector(
    state => state.teacherSections.demoSectionCreationInProgress,
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    dispatch(fetchDemoPresets());
  }, [dispatch]);

  // CustomDialog closes on Escape and the close button but not on an outside
  // click, so we close it ourselves when a mousedown lands outside the dialog
  // box (i.e. on the surrounding overlay). Don't close mid-creation so we
  // don't tear down the dialog before the request resolves.
  React.useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (creationInProgress) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[role="dialog"]')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose, creationInProgress]);

  const options = DEMO_TYPE_ORDER.map(demoType => demoPresets[demoType]).filter(
    (preset): preset is DemoPresetView => !!preset,
  );

  const onSelect = async (demoType: DemoType) => {
    setErrorMessage(null);
    try {
      await dispatch(createDemoSection(demoType));
      onClose();
    } catch (error) {
      console.error(`Failed to create ${demoType} practice class`, error);
      setErrorMessage(
        error instanceof DemoSectionCreationError
          ? error.message
          : "Couldn't create your practice section.",
      );
    }
  };

  return (
    <CustomDialog
      onClose={onClose}
      aria-labelledby="dsco-dialog-description"
      className={styles.dialog}
    >
      <h2 id="dsco-dialog-description" className={styles.heading}>
        Pick the grade for your practice class
      </h2>
      {creationInProgress ? (
        <LinearProgress
          className={styles.progress}
          aria-label="Creating your practice section"
        />
      ) : (
        errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )
      )}
      <div className={styles.options}>
        {options.map(preset => (
          <button
            key={preset.demoType}
            type="button"
            className={styles.option}
            onClick={() => onSelect(preset.demoType)}
            disabled={creationInProgress}
          >
            <span className={styles.iconWrapper}>
              <FontAwesomeV6Icon
                iconName={DEMO_TYPE_ICONS[preset.demoType]}
                iconStyle="regular"
                className={styles.icon}
              />
            </span>
            <span className={styles.title}>
              {DEMO_TYPE_TITLES[preset.demoType]}
            </span>
            <span className={styles.grades}>{formatGrades(preset.grades)}</span>
            <span className={styles.curriculum}>
              Curriculum: {curriculumName(preset)}
            </span>
            <span className={styles.loginType}>
              Login type: {loginTypeLabel(preset.loginType)}
            </span>
          </button>
        ))}
      </div>
    </CustomDialog>
  );
};
