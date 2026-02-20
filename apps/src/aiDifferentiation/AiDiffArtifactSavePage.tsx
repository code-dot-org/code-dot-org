import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {ChangeEvent, useCallback, useMemo, useState} from 'react';

import {clearPendingArtifactMessage} from '@cdo/apps/aichat/redux/slice';
import {TeacherSectionState} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

interface Props {
  message: ChatTextMessage;
}

interface IdSet {
  [id: string]: boolean;
}

interface ServerLessonInfo {
  id: number;
  name: string;
}

interface LessonInfo {
  value: string;
  text: string;
}

interface LessonList {
  [unitId: string]: LessonInfo[];
}

const AiDiffArtifactSavePage: React.FC<Props> = ({message}) => {
  const [selectedSectionIds, setSelectedSectionIds] = useState<IdSet>({});
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [lessonInfo, setLessonInfo] = useState<LessonList>({});
  const [unitLessons, setUnitLessons] = useState<LessonInfo[]>([]);
  const [toggleValue, setToggleValue] = useState<boolean>(true);

  const sections: TeacherSectionState = useAppSelector(state => {
    return state.teacherSections || {};
  });

  const activeStudentSections = sections.sectionIds
    .map(sectionId => sections.sections[sectionId])
    .filter(section => {
      return !section.hidden && section.participantType === 'student';
    });

  const swapLessonInfo = useCallback(
    async (unitId: string) => {
      // Look in state to see if we loaded lesson info yet
      let nextLessonInfo = lessonInfo[unitId];

      // Lazy load lesson names
      if (!nextLessonInfo) {
        setUnitLessons([]);
        const response = await HttpClient.get(`/s/${unitId}/lessons`);
        const unitLessonInfo = (await response.json()) as ServerLessonInfo[];
        const formattedLessonInfo = unitLessonInfo.map(serverLesson => {
          return {
            value: serverLesson.id.toString(),
            text: serverLesson.name,
          };
        });
        setLessonInfo({...lessonInfo, [unitId]: formattedLessonInfo});
        nextLessonInfo = formattedLessonInfo;
      }

      // Update lesson dropdown and select first lesson by default
      setUnitLessons(nextLessonInfo);
      if (nextLessonInfo[0]) {
        setSelectedLessonId(nextLessonInfo[0].value);
      }
    },
    [lessonInfo]
  );

  const handleUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const unitId = event.target.value;
    setSelectedUnitId(unitId);
    swapLessonInfo(unitId);
  };

  const handleLessonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedLessonId(event.target.value);
  };

  const onSubmit = () => {
    const info = JSON.stringify({
      messageId: message.id,
      sectionIds: Object.keys(selectedSectionIds).filter(
        // Need to filter out the checkboxes that have been selected and then
        // deselected. The key will exist in the object with a value of false.
        id => selectedSectionIds[id]
      ),
      unitId: selectedUnitId,
      lessonId: selectedLessonId,
    });

    HttpClient.post('/aidiff_artifacts/', info, true, {
      'Content-Type': 'application/json',
    }).then(() => dispatch(clearPendingArtifactMessage()));
  };

  const unitMenuList = useMemo(() => {
    // TODO: dedupe these
    const curriculumIds = activeStudentSections.map(section => {
      return {
        courseOfferingId: section.courseOfferingId,
        courseVersionId: section.courseVersionId,
      };
    });

    const menuItems = curriculumIds
      .map(ids => {
        const courseOfferingId = ids.courseOfferingId;
        const courseVersionId = ids.courseVersionId;
        if (
          !courseOfferingId ||
          !courseVersionId ||
          !sections.courseOfferings[courseOfferingId]
        ) {
          return null;
        }
        const courseOffering = sections.courseOfferings[courseOfferingId];
        const courseVersion = courseOffering.course_versions[courseVersionId];
        if (!courseVersion) {
          return null;
        }
        return {
          label: courseVersion.name,
          groupItems: Object.values(courseVersion.units).map(unit => {
            return {
              value: unit.id,
              text: unit.name,
            };
          }),
        };
      })
      .filter(item => item !== null);

    // Init lesson menu to initial unit
    if (menuItems[0] && menuItems[0].groupItems[0]) {
      const firstUnitId = menuItems[0].groupItems[0].value;
      if (!selectedUnitId) {
        setSelectedUnitId(firstUnitId);
        swapLessonInfo(firstUnitId);
      }
    }

    return menuItems;
  }, [activeStudentSections, sections, swapLessonInfo, selectedUnitId]);

  const dispatch = useAppDispatch();

  const toggleAll = () => {
    setSelectedSectionIds(
      sections.sectionIds.reduce((acc, id) => ({...acc, [id]: toggleValue}), {})
    );
    setToggleValue(oldValue => !oldValue);
  };

  return activeStudentSections.length && unitMenuList.length ? (
    <div className={style.artifactConfiguration}>
      <div className={style.artifactConfigurationSection}>
        <h3>Which class sections do you want to save this artifact for?</h3>
        <h4>
          The artifact will be shown on the Lesson Materials page for all
          selected class sections.
        </h4>
        <div className={style.artifactConfigurationSectionHeader}>
          <h6>Class Sections</h6>
          <a href="#" onClick={toggleAll}>
            Select All
          </a>
        </div>

        <div className={style.artifactConfigurationCheckboxes}>
          {activeStudentSections.map(section => (
            <Checkbox
              size="m"
              label={section.name}
              key={`${section.id}`}
              name={`${section.id}`}
              value={`${section.id}`}
              checked={selectedSectionIds[section.id] || false}
              onChange={e =>
                setSelectedSectionIds({
                  ...selectedSectionIds,
                  [section.id]: e.target.checked,
                })
              }
            />
          ))}
        </div>
      </div>
      <div className={style.artifactConfigurationSection}>
        <h3>Which lesson do you want to save this artifact for?</h3>
        <h4>
          The artifact will be shown on the Lesson Materials page for this
          lesson.
        </h4>
        <div className={style.artifactConfigurationDropdowns}>
          <SimpleDropdown
            itemGroups={unitMenuList}
            labelText="Unit"
            name="unit-dropdown"
            selectedValue={selectedUnitId}
            onChange={handleUnitChange}
          />
          <SimpleDropdown
            items={unitLessons}
            labelText="Lesson"
            name="lesson-dropdown"
            selectedValue={selectedLessonId}
            onChange={handleLessonChange}
          />
        </div>
      </div>
      <a
        href="https://support.code.org/hc/en-us/articles/115001595051-Finding-curriculum-and-lesson-plans"
        rel="noreferrer"
        target="_blank"
        className={style.artifactConfigurationFAQLink}
      >
        <span>How do I access my lesson materials?</span>
        <FontAwesomeV6Icon iconName="arrow-up-right-from-square" />
      </a>
      <div className={style.artifactConfigurationSaveButtons}>
        <Button
          size="m"
          type="secondary"
          color="black"
          onClick={() => dispatch(clearPendingArtifactMessage())}
          text="Cancel"
        />
        <Button
          size="m"
          type="primary"
          color="purple"
          onClick={onSubmit}
          text="Save selections"
          disabled={
            Object.values(selectedSectionIds).filter(value => value === true)
              .length === 0 ||
            !selectedUnitId ||
            !selectedLessonId
          }
        />
      </div>
    </div>
  ) : (
    <div className={style.artifactConfiguration}>
      <div className={style.artifactConfigurationSection}>
        You are required to have at least one active section with curriculum
        assigned in order to create an artifact. Please create a section from
        your <a href="/teacher_dashboard/home">dashboard</a> and then try to
        create this artifact again.
      </div>
      <div className={style.artifactConfigurationSaveButtons}>
        <Button
          size="m"
          type="secondary"
          color="black"
          onClick={() => dispatch(clearPendingArtifactMessage())}
          text="Cancel"
        />
      </div>
    </div>
  );
};

export default AiDiffArtifactSavePage;
