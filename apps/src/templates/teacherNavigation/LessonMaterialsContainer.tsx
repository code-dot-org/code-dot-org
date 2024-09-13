import _ from 'lodash';
import React, {useState, useMemo, useCallback} from 'react';
import {useLoaderData} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {getStore} from '@cdo/apps/redux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

import ResourceRow from './ResourceRow';

type Lesson = {
  name: string;
  id: number;
  position: number;
  resources: {
    Teacher: {
      key: string;
      name: string;
      url: string;
      downloadUrl: string | null;
      audience: string;
      type: string;
    }[];
  };
};

interface LessonMaterialsData {
  title: string;
  unitNumber: number;
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
  return i18n.lessonNumberAndName({
    lessonNumber: lessonPosition,
    lessonName: lessonName,
  });
};

const LessonMaterialsContainer: React.FC = () => {
  const loadedData = useLoaderData() as LessonMaterialsData | null;
  const lessons = useMemo(() => loadedData?.lessons || [], [loadedData]);

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

  return (
    <div>
      <SimpleDropdown
        labelText={i18n.chooseLesson()}
        isLabelVisible={false}
        onChange={event => onDropdownChange(event.target.value)}
        items={lessonOptions}
        selectedValue={
          selectedLesson ? selectedLesson.id.toString() : 'no lesson'
        }
        name={'lessons-in-assigned-unit-dropdown'}
        size="s"
      />
      {/* Note that this is just a "proof of concept row" - the actual implementation would be more complex */}
      {selectedLesson && (
        <ResourceRow
          unitNumber={5} // note that this is a placeholder value
          lessonNumber={selectedLesson.position}
          resource={selectedLesson.resources.Teacher[0] || null} // note that this is a placeholder value
        />
      )}
    </div>
  );
};

export default LessonMaterialsContainer;
