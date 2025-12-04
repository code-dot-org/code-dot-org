import {Button} from '@code-dot-org/component-library/button';
import {Dialog} from '@code-dot-org/component-library/dialog';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyTwoText,
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import _ from 'lodash';
import React, {useState, useMemo, useCallback} from 'react';
import {useSelector} from 'react-redux';

import {EXT_COMPONENT_OPEN_FAB_EVENT} from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  asyncLoadCoursesWithProgress,
  getSelectedUnitId,
} from '@cdo/apps/redux/unitSelectionRedux';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';
import AIBotTAIcon from '@cdo/static/ai-bot-ta-tag-icon.png';

import UnitSelectorV2 from '../../UnitSelectorV2';

import {LessonMaterialsEmptyState} from './LessonMaterialsEmptyState';
import {Lesson} from './LessonMaterialTypes';
import LessonResources from './LessonResources';
import {AIF_UNITS} from './LessonSummaryConstants';
import UnitResourcesDropdown from './UnitResourcesDropdown';

import styles from './lesson-materials.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

interface LessonMaterialsData {
  unitId: number;
  unitName?: string;
  title: string;
  unitNumber: number;
  scriptOverviewPdfUrl: string;
  scriptResourcesPdfUrl: string;
  lessons: Lesson[];
  hasNumberedUnits: boolean;
  hasUnnumberedLessons: boolean;
  versionYear?: number;
}

interface LessonSummaryInfo {
  learning_objective: string;
  lesson_beats: string[];
  misconceptions: string[];
  tips: string[];
}

interface LessonSummaryInfoResponse {
  lesson_summary: string;
}

const lessonMaterialsApiCall = (unitId: number) =>
  HttpClient.fetchJson<LessonMaterialsData>(
    `/dashboardapi/lesson_materials/${unitId}`
  ).then(response => response?.value);

const skeletonDropdown = () => (
  <div
    className={classNames(
      styles.skeletonDropdown,
      skeletonizeContent.skeletonizeContent
    )}
  />
);

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

const handleLessonSummaryAskAITAClick = () => {
  const openAITAEvent = new Event(EXT_COMPONENT_OPEN_FAB_EVENT, {
    bubbles: true,
  });
  document.dispatchEvent(openAITAEvent);
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
  const [aiTALessonSummaryInfo, setAITALessonSummaryInfo] =
    useState<LessonSummaryInfo | null>(null);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [finishedListeningToSummary, setFinishedListeningToSummary] =
    useState(false);

  const userId = useAppSelector(state => state.currentUser.userId);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const needsReload = useAppSelector(
    state => state.teacherSections.needsReload
  );

  const showAITALessonSummary = useAppSelector(
    state => state.currentUser.showAITALessonSummary
  );

  const unitName = useAppSelector(
    state => state.teacherSections.selectedSectionUnitName
  );

  // This checks to see if the AI lesson summaries experiment or DCDO key are set
  // or if the section has AIF assigned in order to enable AI Lesson Summaries
  const canShowLessonSummaries =
    (showAITALessonSummary || AIF_UNITS.includes(unitName)) &&
    aiTALessonSummaryInfo;

  const hasCompletedPersonalizationQuiz = useAppSelector(
    state => state.currentUser.hasCompletedPersonalizationQuiz
  );

  const audioSummaryTranscript = useAppSelector(
    state => state.currentUser.audioSummaryTranscript
  );

  const selectedUnitId = useSelector(getSelectedUnitId);

  const dispatch = useAppDispatch();

  const lessonMaterialsCachedLoader = React.useMemo(
    () => _.memoize(lessonMaterialsApiCall),
    []
  );

  React.useEffect(() => {
    dispatch(asyncLoadCoursesWithProgress());
  }, [dispatch]);

  const isLoadingCoursesWithProgress = useSelector(
    (state: {unitSelection: {isLoadingCoursesWithProgress: boolean}}) =>
      state.unitSelection.isLoadingCoursesWithProgress
  );

  const unitToLoad = React.useMemo(
    () =>
      !!selectedSection.unitId
        ? selectedUnitId || selectedSection.unitId
        : null,
    [selectedSection.unitId, selectedUnitId]
  );

  React.useEffect(() => {
    const selectedSectionId = selectedSection.id;
    if (!selectedSectionId || !unitToLoad) {
      setLessonMaterials(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (isLoadingCoursesWithProgress) {
      return;
    }

    lessonMaterialsCachedLoader(unitToLoad).then(data => {
      setLessonMaterials(data);
      setIsLoading(false);

      if (data?.unitName) {
        analyticsReporter.sendEvent(EVENTS.VIEW_LESSON_MATERIALS, {
          unitName: data.unitName,
        });
      }
    });
  }, [
    isLoadingCoursesWithProgress,
    unitToLoad,
    selectedSection.id,
    lessonMaterialsCachedLoader,
  ]);

  const {
    hasNumberedUnits,
    hasUnnumberedLessons,
    lessons,
    unitNumber,
    versionYear,
  } = useMemo(() => {
    return {
      hasNumberedUnits: lessonMaterials?.hasNumberedUnits || false,
      hasUnnumberedLessons: lessonMaterials?.hasUnnumberedLessons || false,
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
    if (selectedLesson) {
      HttpClient.fetchJson<LessonSummaryInfoResponse>(
        `/ai_lesson_summaries/show?lesson_id=${selectedLesson?.id}`
      )
        .then(response => {
          const preParsedResponse = response.value?.lesson_summary;
          setAITALessonSummaryInfo(
            response.response.ok && preParsedResponse
              ? JSON.parse(preParsedResponse)
              : null
          );
        })
        .catch(error => {
          setAITALessonSummaryInfo(null);
          console.log(`Error: ${error}`);
        });
    }
  }, [userId, selectedLesson]);

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

  const renderHeader = () => {
    return (
      <div className={styles.lessonMaterialsPageHeader}>
        <div className={styles.lessonMaterialsDropdowns}>
          <UnitSelectorV2
            filterToSelectedCourse={true}
            className={styles.unitSelector}
          />
          {isLoading || isLoadingCoursesWithProgress || needsReload ? (
            skeletonDropdown()
          ) : (
            <SimpleDropdown
              labelText={i18n.chooseLesson()}
              isLabelVisible={false}
              onChange={event => onDropdownChange(event.target.value)}
              items={lessonOptions}
              color="gray"
              selectedValue={selectedLesson ? selectedLesson.id.toString() : ''}
              name={'lessons-in-assigned-unit-dropdown'}
              size="s"
              id="ui-test-lessons-in-assigned-unit-dropdown"
            />
          )}
        </div>
        {lessonMaterials && (
          <UnitResourcesDropdown
            hasNumberedUnits={hasNumberedUnits}
            unitNumber={lessonMaterials.unitNumber}
            scriptOverviewPdfUrl={lessonMaterials.scriptOverviewPdfUrl}
            scriptResourcesPdfUrl={lessonMaterials.scriptResourcesPdfUrl}
            disabled={isLoading || needsReload}
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

  const renderLessonSummaryContainer = () => {
    return (
      <>
        {showTranscriptDialog && audioSummaryTranscript && (
          <Dialog
            title={i18n.audioTranscript()}
            primaryButtonProps={{
              text: i18n.closeDialog(),
              onClick: () => setShowTranscriptDialog(false),
            }}
            onClose={() => setShowTranscriptDialog(false)}
            closeLabel={i18n.closeTranscript()}
            customContent={
              <div className={styles.transcriptDialogContent}>
                {audioSummaryTranscript.map(({timeStamp, text}) => (
                  <div
                    key={`transcript-line-${timeStamp}`}
                    className={styles.transcriptLine}
                  >
                    <BodyTwoText className={styles.transcriptLineTimeStamp}>
                      {timeStamp}
                    </BodyTwoText>
                    <BodyTwoText>{text}</BodyTwoText>
                  </div>
                ))}
              </div>
            }
            className={styles.transcriptDialog}
          />
        )}
        <div className={styles.lessonSummaryContainer}>
          {experiments.isEnabled('ai-lesson-podcasts') && (
            <div className={styles.lessonSummarySection}>
              <div className={styles.lessonSummarySectionHeader}>
                <div className={styles.lessonSummarySectionTitle}>
                  <FontAwesomeV6Icon iconName="headphones" iconStyle="solid" />
                  <BodyTwoText>{i18n.audioSummary()}</BodyTwoText>
                </div>
                <Button
                  type="secondary"
                  size="xs"
                  color="black"
                  className={styles.openTranscriptButton}
                  text={i18n.transcript()}
                  onClick={() => setShowTranscriptDialog(true)}
                />
              </div>
              <div className={styles.audioPlayerContainer}>
                {/* We're including our own custom time-stamped transcript dialog, so no need for media caption. */}
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                  id="lesson-summary-audio"
                  src="https://tts.code.org/sharon22k/180/100/e91c9a88c669b0aeba648353cc478452/courseC_maze_programming9.mp3"
                  preload="auto"
                  controls
                  onEnded={() => setFinishedListeningToSummary(true)}
                  className={styles.audioPlayer}
                />
                {finishedListeningToSummary && (
                  <FontAwesomeV6Icon
                    iconName="circle-check"
                    iconStyle="solid"
                  />
                )}
              </div>
            </div>
          )}
          <div className={styles.lessonSummarySection}>
            <div className={styles.lessonSummarySectionTitle}>
              <FontAwesomeV6Icon iconName="lightbulb" iconStyle="solid" />
              <BodyTwoText>{i18n.teachingTips()}</BodyTwoText>
            </div>
            <div className={styles.lessonSummaryInfo}>
              <div className={styles.lessonSummaryInfoBlock}>
                <BodyThreeText>{i18n.learningObjective()}</BodyThreeText>
                <BodyThreeText>
                  {aiTALessonSummaryInfo?.learning_objective}
                </BodyThreeText>
              </div>
              <div className={styles.lessonSummaryInfoBlock}>
                <BodyThreeText>{i18n.keyLessonBeats()}</BodyThreeText>
                <ol>
                  {aiTALessonSummaryInfo?.lesson_beats.map(
                    (lessonBeat, index) => (
                      <li key={`lessonBeat-${index}`}>
                        <BodyThreeText>{lessonBeat}</BodyThreeText>
                      </li>
                    )
                  )}
                </ol>
              </div>
              <div className={styles.lessonSummaryInfoBlock}>
                <BodyThreeText>{i18n.tipsHeader()}</BodyThreeText>
                <ol>
                  {aiTALessonSummaryInfo?.tips.map((tip, index) => (
                    <li key={`tip-${index}`}>
                      <BodyThreeText>{tip}</BodyThreeText>
                    </li>
                  ))}
                </ol>
              </div>
              <div className={styles.lessonSummaryInfoBlock}>
                <BodyThreeText>{i18n.commonMisconceptions()}</BodyThreeText>
                <ul>
                  {aiTALessonSummaryInfo?.misconceptions.map(
                    (misconception, index) => (
                      <li key={`misconception-${index}`}>
                        <BodyThreeText>{misconception}</BodyThreeText>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
            <Button
              type="secondary"
              color="black"
              className={styles.askAITAButton}
              text={i18n.questionForAITA()}
              onClick={handleLessonSummaryAskAITAClick}
            />
            {!hasCompletedPersonalizationQuiz && (
              <div className={styles.personalizationQuizSection}>
                <div className={styles.horizontalLine} />
                <div className={styles.personalizationQuizPrompt}>
                  <BodyThreeText>
                    {i18n.wantToSeeDifferentInformation()}
                  </BodyThreeText>
                  <a href="/users/personalization_information">
                    <BodyThreeText>
                      {i18n.customizeForYourClassroom()}
                    </BodyThreeText>
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className={styles.poweredByAITANote}>
            <img src={AIBotTAIcon} alt="" />
            <BodyFourText>{i18n.poweredByAITA()}</BodyFourText>
          </div>
        </div>
      </>
    );
  };

  if (
    hasEmptyState &&
    !isLoading &&
    !isLoadingCoursesWithProgress &&
    !needsReload
  ) {
    return (
      <LessonMaterialsEmptyState
        isLegacyScript={isLegacyScript}
        hasNoLessonsWithLessonPlans={hasNoLessonsWithLessonPlans}
      />
    );
  }

  return (
    <div className={styles.lessonContainer}>
      <div className={styles.lessonMaterialsContainer}>
        {renderHeader()}
        {isLoading || needsReload ? (
          <div>
            <Spinner size={'large'} />
          </div>
        ) : (
          <>
            {renderTeacherResources()}
            {renderStudentResources()}
          </>
        )}
      </div>
      {canShowLessonSummaries && renderLessonSummaryContainer()}
    </div>
  );
};

export default LessonMaterialsContainer;
