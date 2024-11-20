import _ from 'lodash';
import React, {useState, useMemo, useCallback} from 'react';
import {useLoaderData} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

import {LessonMaterialsEmptyState} from './LessonMaterialsEmptyState';
import {Lesson} from './LessonMaterialTypes';
import LessonResources from './LessonResources';
import UnitResourcesDropdown from './UnitResourcesDropdown';

import styles from './lesson-materials.module.scss';

interface LessonMaterialsData {
  unitId: number;
  unitName?: string;
  title: string;
  unitNumber: number;
  scriptOverviewPdfUrl: string;
  scriptResourcesPdfUrl: string;
  lessons: Lesson[];
  hasNumberedUnits: boolean;
  versionYear?: number;
}

const lessonMaterialsCachedLoader = _.memoize(
  async (assignedUnitId, unitName) =>
    getAuthenticityToken()
      .then(token =>
        fetch(`/dashboardapi/lesson_materials/${assignedUnitId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token,
          },
        })
      )
      .then(response => {
        return response.json();
      })
      .then(json => {
        return {...json, unitName};
      })
      .catch(error => {
        console.error('Error loading lesson materials', error);
        analyticsReporter.sendEvent(EVENTS.LESSON_MATERIALS_FAILURE, {
          unitName: unitName,
        });
        return null;
      })
);

export const lessonMaterialsLoader =
  async (): Promise<LessonMaterialsData | null> => {
    const state = getStore().getState().teacherSections;
    const selectedSectionId = state.selectedSectionId;
    const sectionData = state.sections[selectedSectionId];

    if (!selectedSectionId || !sectionData.unitId) {
      return null;
    }

    return lessonMaterialsCachedLoader(
      sectionData.unitId,
      sectionData.unitName
    );
  };

// Some lessons are lockable and don't have lesson plans (typically assessments or surveys).
// In this case, we want to display the lesson name without a number.  See CSP1-2022 for an example.
const createDisplayName = (
  lessonName: string,
  lessonPosition: number,
  hasLessonPlan: boolean,
  isLockable: boolean
) => {
  if (isLockable && !hasLessonPlan) {
    return lessonName;
  } else {
    return i18n.lessonNumberAndName({
      lessonNumber: lessonPosition,
      lessonName: lessonName,
    });
  }
};

interface LessonMaterialsContainerProps {
  showNoCurriculumAssigned: boolean;
}

const LessonMaterialsContainer: React.FC<LessonMaterialsContainerProps> = ({
  showNoCurriculumAssigned,
}) => {
  const loadedData = useLoaderData() as LessonMaterialsData | null;
  const {hasNumberedUnits, lessons, unitNumber, versionYear} = useMemo(() => {
    return {
      hasNumberedUnits: loadedData?.hasNumberedUnits || false,
      lessons: loadedData?.lessons || [],
      unitNumber: loadedData?.unitNumber || -1,
      versionYear: loadedData?.versionYear || -1,
    };
  }, [loadedData]);
  const isLegacyScript = useMemo(() => versionYear < 2021, [versionYear]);

  const hasNoLessonsWithLessonPlans = useMemo(() => {
    return lessons.every(lesson => !lesson.hasLessonPlan);
  }, [lessons]);

  const hasEmptyState =
    isLegacyScript ||
    showNoCurriculumAssigned ||
    hasNoLessonsWithLessonPlans ||
    !loadedData;

  const getLessonFromId = (lessonId: number): Lesson | null => {
    return lessons.find(lesson => lesson.id === lessonId) || null;
  };

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  React.useEffect(() => {
    if (lessons.length > 0) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessons]);

  React.useEffect(() => {
    analyticsReporter.sendEvent(EVENTS.VIEW_LESSON_MATERIALS, {
      unitName: loadedData?.unitName,
    });
  }, [loadedData?.unitName]);

  const onDropdownChange = (value: string) => {
    setSelectedLesson(getLessonFromId(Number(value)));

    analyticsReporter.sendEvent(EVENTS.LESSON_MATERIALS_LESSON_CHANGE, {
      unitName: loadedData?.unitName,
      lessonId: value,
    });
  };

  const generateLessonDropdownOptions = useCallback(() => {
    return lessons.map((lesson: Lesson) => {
      const displayName = createDisplayName(
        lesson.name,
        lesson.position,
        lesson.hasLessonPlan,
        lesson.isLockable
      );
      return {text: displayName, value: lesson.id.toString()};
    });
  }, [lessons]);

  const lessonOptions = useMemo(
    () => generateLessonDropdownOptions(),
    [generateLessonDropdownOptions]
  );

  const renderHeader = () => {
    return (
      <div className={styles.lessonMaterialsPageHeader}>
        <SimpleDropdown
          labelText={i18n.chooseLesson()}
          isLabelVisible={false}
          onChange={event => onDropdownChange(event.target.value)}
          items={lessonOptions}
          selectedValue={selectedLesson ? selectedLesson.id.toString() : ''}
          name={'lessons-in-assigned-unit-dropdown'}
          size="s"
        />
        {loadedData?.unitNumber && (
          <UnitResourcesDropdown
            hasNumberedUnits={hasNumberedUnits}
            unitNumber={loadedData.unitNumber}
            scriptOverviewPdfUrl={loadedData.scriptOverviewPdfUrl}
            scriptResourcesPdfUrl={loadedData.scriptResourcesPdfUrl}
          />
        )}
      </div>
    );
  };

  const renderTeacherResources = () => {
    if (!selectedLesson) {
      return null;
    }

    return (
      <LessonResources
        unitNumber={hasNumberedUnits ? unitNumber : null}
        lessonNumber={selectedLesson.position}
        resources={selectedLesson.resources.Teacher || []}
        standardsUrl={selectedLesson.standardsUrl}
        vocabularyUrl={selectedLesson.vocabularyUrl}
        lessonPlanUrl={selectedLesson.lessonPlanHtmlUrl}
        lessonPlanPdfUrl={selectedLesson.lessonPlanPdfUrl}
        lessonName={selectedLesson.name}
        hasLessonPlan={selectedLesson.hasLessonPlan}
      />
    );
  };

  const renderStudentResources = () => {
    if (!selectedLesson) {
      return null;
    }

    return (
      <LessonResources
        unitNumber={hasNumberedUnits ? unitNumber : null}
        lessonNumber={selectedLesson.position}
        resources={selectedLesson.resources.Student || []}
      />
    );
  };

  if (hasEmptyState) {
    return (
      <LessonMaterialsEmptyState
        showNoCurriculumAssigned={showNoCurriculumAssigned}
        isLegacyScript={isLegacyScript}
        hasNoLessonsWithLessonPlans={hasNoLessonsWithLessonPlans}
      />
    );
  }

  return (
    <div>
      {renderHeader()}
      {renderTeacherResources()}
      {renderStudentResources()}
    </div>
  );
};

export default LessonMaterialsContainer;
