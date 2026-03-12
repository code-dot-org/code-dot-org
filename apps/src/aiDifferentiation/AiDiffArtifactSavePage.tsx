import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {ChangeEvent, useCallback, useMemo, useState} from 'react';

import {
  addThreadMessage,
  clearPendingArtifactMessage,
  setArtifact,
} from '@cdo/apps/aichat/redux/slice';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {TeacherSectionState} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  AiDiffArtifactType,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {EVENTS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';

import {ChatTextMessage, artifactValidatorHelper} from './types';

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
  const [artifactTitle, setArtifactTitle] = useState<string>('');

  const sections: TeacherSectionState = useAppSelector(state => {
    return state.teacherSections || {};
  });
  const threadId = useAppSelector(state => state.aichat.threadId);

  const artifactTitleIsEmpty = useMemo(() => {
    return artifactTitle.trim() === '';
  }, [artifactTitle]);

  const activeStudentSections = sections.sectionIds
    .map(sectionId => sections.sections[sectionId])
    .filter(section => {
      return !section.hidden && section.participantType === 'student';
    });

  const reportingData = React.useMemo(() => {
    return {
      messageId: message.id,
      artifactType: message.artifactCandidateType,
      artifactContent: message.chatMessageText,
      candidateSectionIds: activeStudentSections.map(section => {
        return section.id;
      }),
    };
  }, [message, activeStudentSections]);

  const sendArtifactEvent = React.useCallback(
    (event: (typeof EVENTS)[keyof typeof EVENTS], prompt?: string) => {
      const responseEventData = {
        ...reportingData,
        threadId: threadId,
        url: window.location.href,
        prompt: prompt,
        selectedSectionIds,
        artifactTitle,
        selectedUnitId,
        selectedLessonId,
      };
      analyticsReporter.sendEvent(event, responseEventData);
    },
    [
      reportingData,
      threadId,
      selectedSectionIds,
      artifactTitle,
      selectedUnitId,
      selectedLessonId,
    ]
  );

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
      title: artifactTitle,
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
    })
      .then(response => response.json())
      .then(json => {
        dispatch(setArtifact(artifactValidatorHelper(json)));
        dispatch(
          addThreadMessage({
            role: Role.ASSISTANT,
            chatMessageText: `I've created an artifact for this ${
              json.type === AiDiffArtifactType.EXIT_TICKET
                ? 'exit ticket'
                : 'lesson hook'
            }. Click the button below for a projection view to share with your students.`,
            status: Status.OK,
            isArtifact: true,
          })
        );
      })
      .finally(() => {
        dispatch(clearPendingArtifactMessage());
        sendArtifactEvent(EVENTS.AI_ARTIFACT_SAVED);
      });
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
      <div className={style.artifactConfigurationTitleSection}>
        <h3>Title:</h3>
        <input
          id="uitest-artifact-titleinput"
          className={style.artifactTitleInput}
          maxLength={128}
          placeholder={'Give this artifact a name...'}
          aria-label={'Give this artifact a name'}
          onChange={e => setArtifactTitle(e.target.value)}
          type="text"
        />
      </div>
      <div className={style.artifactConfigurationSection}>
        <h3>Which class sections do you want to save this artifact for?</h3>
        <h4>
          The artifact will be shown on the Lesson Materials page for all
          selected class sections.
        </h4>
        <div className={style.artifactConfigurationSectionHeader}>
          <h6>Class Sections</h6>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={toggleAll}
            type="button"
          >
            {'Select All'}
          </MuiButton>
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
        <MuiButton
          variant="outlined"
          color="secondary"
          size="medium"
          onClick={() => {
            dispatch(clearPendingArtifactMessage());
            sendArtifactEvent(EVENTS.AI_ARTIFACT_SAVE_CANCELLED);
          }}
          type="button"
        >
          {'Cancel'}
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          disabled={
            Object.values(selectedSectionIds).filter(value => value === true)
              .length === 0 ||
            !selectedUnitId ||
            !selectedLessonId ||
            artifactTitleIsEmpty
          }
          onClick={onSubmit}
          type="button"
        >
          {'Save selections'}
        </MuiButton>
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
        <MuiButton
          variant="outlined"
          color="secondary"
          size="medium"
          onClick={() => dispatch(clearPendingArtifactMessage())}
          type="button"
        >
          {'Cancel'}
        </MuiButton>
      </div>
    </div>
  );
};

export default AiDiffArtifactSavePage;
