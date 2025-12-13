import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import classNames from 'classnames';
import React, {useMemo, useCallback, useEffect} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import styles from './lessonSelector.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

// Some lessons are lockable and don't have lesson plans (typically assessments or surveys).
// In this case, we want to display the lesson name without a number.  See CSP1-2022 for an example.
const createDisplayName = (
  lessonName: string,
  lessonPosition: number,
  hasLessonPlan: boolean,
  isLockable: boolean,
  hasUnnumberedLessons: boolean
) => {
  if (hasUnnumberedLessons || (isLockable && !hasLessonPlan)) {
    return lessonName;
  } else {
    return i18n.lessonNumberAndName({
      lessonNumber: lessonPosition,
      lessonName: lessonName,
    });
  }
};

const skeletonDropdown = () => (
  <div
    className={classNames(
      styles.skeletonDropdown,
      skeletonizeContent.skeletonizeContent
    )}
  />
);
export interface LessonOption {
  id: number;
  name: string;
  hasLessonPlan: boolean;
  isLockable: boolean;
  position: number;
}

interface LessonSelectorProps {
  lessons: LessonOption[];
  selectedLesson: LessonOption | null;
  onLessonChange: (lessonId: number) => void;
  hasUnnumberedLessons: boolean;
  isLoading?: boolean;
  unitName?: string;
  className?: string;
  isLabelVisible?: boolean;
  labelText?: string;
}

const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  selectedLesson,
  onLessonChange,
  hasUnnumberedLessons,
  isLoading = false,
  unitName,
  className,
  isLabelVisible = false,
  labelText = i18n.chooseLesson(),
}) => {
  const onDropdownChange = (value: string) => {
    onLessonChange(Number(value));

    analyticsReporter.sendEvent(EVENTS.LESSON_MATERIALS_LESSON_CHANGE, {
      unitName,
      lessonId: value,
    });
  };

  const generateLessonDropdownOptions = useCallback(() => {
    return lessons.map((lesson: LessonOption) => {
      const displayName = createDisplayName(
        lesson.name,
        lesson.position,
        lesson.hasLessonPlan,
        lesson.isLockable,
        hasUnnumberedLessons
      );
      return {text: displayName, value: lesson.id.toString()};
    });
  }, [lessons, hasUnnumberedLessons]);

  const lessonOptions = useMemo(
    () => generateLessonDropdownOptions(),
    [generateLessonDropdownOptions]
  );

  // Auto-select first lesson when lessons change
  useEffect(() => {
    if (lessons.length > 0 && !selectedLesson) {
      onLessonChange(lessons[0].id);
    }
  }, [lessons, selectedLesson, onLessonChange]);

  if (isLoading) {
    return skeletonDropdown();
  }

  return (
    <SimpleDropdown
      labelText={labelText}
      isLabelVisible={isLabelVisible}
      onChange={event => onDropdownChange(event.target.value)}
      items={lessonOptions}
      color="gray"
      selectedValue={selectedLesson ? selectedLesson.id.toString() : ''}
      name={'lessons-in-assigned-unit-dropdown'}
      size="s"
      id="ui-test-lessons-in-assigned-unit-dropdown"
      className={className}
    />
  );
};

export default LessonSelector;
