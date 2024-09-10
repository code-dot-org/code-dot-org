import _ from 'lodash';
import React, {useState, useMemo, useCallback} from 'react';
import {useLoaderData} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {getStore} from '@cdo/apps/redux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

export type Lesson = {
  name: string;
  id: number;
  position: number;
};

interface LessonMaterialsData {
  title: string;
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

    if (!selectedSectionId || !sectionData.unitId) {
      return null;
    }

    return lessonMaterialsCachedLoader(sectionData.unitId);
  };

const createDisplayName = (lessonName: string, lessonPosition: number) => {
  return i18n.lesson() + ' ' + lessonPosition + ' - ' + lessonName;
};

const LessonMaterialsContainer: React.FC = () => {
  const loadedData = useLoaderData() as LessonMaterialsData | null;

  // Memoize the lessons to ensure they only change when loadedData changes
  const lessons = useMemo(() => loadedData?.lessons || [], [loadedData]);

  const [selectedLesson, setSelectedLesson] = useState({
    text: 'No lesson available',
    value: '',
  });

  // UseEffect to update selected lesson once data is available
  React.useEffect(() => {
    if (lessons.length > 0) {
      setSelectedLesson({
        text: createDisplayName(lessons[0].name, lessons[0].position),
        value: createDisplayName(lessons[0].name, lessons[0].position),
      });
    }
  }, [lessons]);

  const generateLessonDropdownOptions = useCallback(() => {
    return lessons.map((lesson: Lesson) => {
      const displayName = createDisplayName(lesson.name, lesson.position);
      return {text: displayName, value: displayName};
    });
  }, [lessons]);

  const lessonOptions = useMemo(
    () => generateLessonDropdownOptions(),
    [generateLessonDropdownOptions]
  );

  return (
    <div>
      <SimpleDropdown
        labelText={i18n.lesson()}
        selectedValue={selectedLesson.value}
        onChange={event =>
          setSelectedLesson({
            text: event.target.value,
            value: event.target.value,
          })
        }
        items={lessonOptions}
        name={'lessons-in-assigned-unit-dropdown'}
        size="s"
      />
    </div>
  );
};

export default LessonMaterialsContainer;
