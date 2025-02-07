import _ from 'lodash';
import React, {useState, useMemo, useCallback} from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
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

const lessonMaterialsCachedLoader = _.memoize(async (unitId: number) =>
  HttpClient.fetchJson<LessonMaterialsData>(
    `/dashboardapi/lesson_materials/${unitId}`
  ).then(response => response?.value)
);

export const lessonMaterialsLoader =
  async (): Promise<LessonMaterialsData | null> => {
    const state = getStore().getState().teacherSections;
    const selectedSectionId = state.selectedSectionId;
    const sectionData = state.sections[selectedSectionId];

    if (!selectedSectionId || !sectionData.unitId) {
      return null;
    }

    return lessonMaterialsCachedLoader(sectionData.unitId);
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
  const [lessonMaterials, setLessonMaterials] =
    useState<LessonMaterialsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const needsReload = useAppSelector(
    state => state.teacherSections.needsReload
  );

  React.useEffect(() => {
    const fetchLessonMaterials = async () => {
      const state = getStore().getState().teacherSections;
      const selectedSectionId = state.selectedSectionId;
      const sectionData = state.sections[selectedSectionId];

      if (!selectedSectionId || !sectionData.unitId) {
        setLessonMaterials(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      await lessonMaterialsCachedLoader(sectionData.unitId).then(data => {
        setLessonMaterials(data);
        setIsLoading(false);

        if (data?.unitName) {
          analyticsReporter.sendEvent(EVENTS.VIEW_LESSON_MATERIALS, {
            unitName: data.unitName,
          });
        }
      });
    };

    fetchLessonMaterials();
  }, [selectedSection]);

  const {hasNumberedUnits, lessons, unitNumber, versionYear} = useMemo(() => {
    return {
      hasNumberedUnits: lessonMaterials?.hasNumberedUnits || false,
      lessons: lessonMaterials?.lessons || [],
      unitNumber: lessonMaterials?.unitNumber || -1,
      versionYear: lessonMaterials?.versionYear || -1,
    };
  }, [lessonMaterials]);
  const isLegacyScript = useMemo(() => versionYear < 2021, [versionYear]);

  const hasNoLessonsWithLessonPlans = useMemo(() => {
    return lessons.every(lesson => !lesson.hasLessonPlan);
  }, [lessons]);

  const hasEmptyState =
    isLegacyScript ||
    showNoCurriculumAssigned ||
    hasNoLessonsWithLessonPlans ||
    !lessonMaterials;

  const getLessonFromId = (lessonId: number): Lesson | null => {
    return lessons.find(lesson => lesson.id === lessonId) || null;
  };

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  React.useEffect(() => {
    if (lessons.length > 0) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessons]);

  const onDropdownChange = (value: string) => {
    setSelectedLesson(getLessonFromId(Number(value)));

    analyticsReporter.sendEvent(EVENTS.LESSON_MATERIALS_LESSON_CHANGE, {
      unitName: lessonMaterials?.unitName,
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
          id="ui-test-lessons-in-assigned-unit-dropdown"
        />
        {lessonMaterials && (
          <UnitResourcesDropdown
            hasNumberedUnits={hasNumberedUnits}
            unitNumber={lessonMaterials.unitNumber}
            scriptOverviewPdfUrl={lessonMaterials.scriptOverviewPdfUrl}
            scriptResourcesPdfUrl={lessonMaterials.scriptResourcesPdfUrl}
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

  if (isLoading || needsReload) {
    return <Spinner size={'large'} />;
  }

  if (hasEmptyState) {
    return (
      <LessonMaterialsEmptyState
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
