import _ from 'lodash';
import React, {useState, useMemo, useCallback} from 'react';
import {useLoaderData} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {getStore} from '@cdo/apps/redux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

import LessonResources from './LessonResources';
import UnitResourcesDropdown from './UnitResourcesDropdown';

import styles from './lesson-materials.module.scss';

type Lesson = {
  name: string;
  id: number;
  position: number;
  lessonPlanHtmlUrl: string;
  standardsUrl: string;
  vocabularyUrl: string;
  resources: {
    Teacher: {
      key: string;
      name: string;
      url: string;
      downloadUrl?: string;
      audience: string;
      type: string;
    }[];
    Student: {
      key: string;
      name: string;
      url: string;
      downloadUrl?: string;
      audience: string;
      type: string;
    }[];
  };
};

interface LessonMaterialsData {
  title: string;
  unitNumber: number;
  scriptOverviewPdfUrl: string;
  scriptResourcesPdfUrl: string;
  lessons: Lesson[];
}

const lessonMaterialsCachedLoader = _.memoize(async assignedUnitId =>
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
    .then(response => response.json())
);

export const lessonMaterialsLoader =
  async (): Promise<LessonMaterialsData | null> => {
    const state = getStore().getState().teacherSections;
    const selectedSectionId = state.selectedSectionId;
    const sectionData = state.sections[selectedSectionId];

    // NOTE: this page is not working for stand alone courses.
    // this is because there is no "unitId" in the sectionData for stand alone courses.

    if (!selectedSectionId || !sectionData.unitId) {
      return null;
    }

    return lessonMaterialsCachedLoader(sectionData.unitId);
  };

const createDisplayName = (lessonName: string, lessonPosition: number) => {
  return i18n.lessonNumberAndName({
    lessonNumber: lessonPosition,
    lessonName: lessonName,
  });
};

const LessonMaterialsContainer: React.FC = () => {
  const loadedData = useLoaderData() as LessonMaterialsData | null;
  const lessons = useMemo(() => loadedData?.lessons || [], [loadedData]);
  const unitNumber = useMemo(() => loadedData?.unitNumber || 1, [loadedData]);

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
  };

  const generateLessonDropdownOptions = useCallback(() => {
    return lessons.map((lesson: Lesson) => {
      const displayName = createDisplayName(lesson.name, lesson.position);
      return {text: displayName, value: lesson.id.toString()};
    });
  }, [lessons]);

  const lessonOptions = useMemo(
    () => generateLessonDropdownOptions(),
    [generateLessonDropdownOptions]
  );

  const renderTeacherResources = () => {
    if (!selectedLesson) {
      return null;
    }

    return (
      <LessonResources
        unitNumber={unitNumber}
        lessonNumber={selectedLesson.position}
        resources={selectedLesson.resources.Teacher || []}
        standardsUrl={selectedLesson.standardsUrl}
        vocabularyUrl={selectedLesson.vocabularyUrl}
        lessonPlanUrl={selectedLesson.lessonPlanHtmlUrl}
        lessonName={selectedLesson.name}
      />
    );
  };

  const renderStudentResources = () => {
    if (!selectedLesson) {
      return null;
    }

    return (
      <LessonResources
        unitNumber={unitNumber}
        lessonNumber={selectedLesson.position}
        resources={selectedLesson.resources.Student || []}
      />
    );
  };

  return (
    <div>
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
            unitNumber={loadedData.unitNumber || 0}
            scriptOverviewPdfUrl={loadedData.scriptOverviewPdfUrl}
            scriptResourcesPdfUrl={loadedData.scriptResourcesPdfUrl}
          />
        )}
      </div>
      {renderTeacherResources()}
      {renderStudentResources()}
    </div>
  );
};

export default LessonMaterialsContainer;
