import {Button} from '@code-dot-org/component-library/button';
import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useState, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {setChatIsOpen} from '@cdo/apps/aichat/redux/slice';
import {fetchThreadMessages} from '@cdo/apps/aichat/redux/thunks';
import {THREAD_TYPES} from '@cdo/apps/aiDifferentiation/constants';
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
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';
import AIBotTAIcon from '@cdo/static/ai-bot-ta-tag-icon.png';

import LessonSelector from '../../teacherDashboardShared/LessonSelector';
import UnitSelectorV2 from '../../teacherDashboardShared/UnitSelectorV2';

import CustomLessonResources from './CustomLessonResources';
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
  script: string;
}

const lessonMaterialsApiCall = (unitId: number) =>
  HttpClient.fetchJson<LessonMaterialsData>(
    `/dashboardapi/lesson_materials/${unitId}`
  ).then(response => response?.value);

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
  const [canShowLessonSummaries, setCanShowLessonSummaries] = useState(false);
  const [audioSummaryTranscript, setAudioSummaryTranscript] =
    useState<string>('');

  const userId = useAppSelector(state => state.currentUser.userId);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const needsReload = useAppSelector(
    state => state.teacherSections.needsReload
  );

  const hasCompletedPersonalizationQuiz = useAppSelector(
    state => state.currentUser.hasCompletedPersonalizationQuiz
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

  const showAITALessonSummary = useAppSelector(
    state => state.currentUser.showAITALessonSummary
  );

  const showAITAPodcasts =
    useAppSelector(state => state.currentUser.showAITAPodcasts) ||
    experiments.isEnabled('ai-lesson-podcasts');

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
      setSelectedLesson(data.lessons[0]);

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

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  React.useEffect(() => {
    if (selectedLesson && showAITALessonSummary) {
      HttpClient.fetchJson<LessonSummaryInfoResponse>(
        `/ai_lesson_summaries/show?lesson_id=${selectedLesson?.id}`
      )
        .then(response => {
          if (response.response.ok) {
            if (response.value?.lesson_summary) {
              setAITALessonSummaryInfo(
                JSON.parse(response.value.lesson_summary)
              );
            }
            if (response.value?.script) {
              setAudioSummaryTranscript(response.value.script);
            }
            setCanShowLessonSummaries(true);
          } else {
            setAITALessonSummaryInfo(null);
            setCanShowLessonSummaries(false);
          }
        })
        .catch(error => {
          setAITALessonSummaryInfo(null);
          setCanShowLessonSummaries(false);
          console.log(`Error: ${error}`);
        });
    }
  }, [userId, selectedLesson, showAITALessonSummary, showAITAPodcasts]);

  const handleLessonSummaryAskAITAClick = () => {
    dispatch(
      fetchThreadMessages({
        contextType: AiDiffContext.LESSON,
        thread: 0,
        threadType: THREAD_TYPES.lessonSummaryHelp,
        curriculumCourses: [],
      })
    );
    dispatch(setChatIsOpen(true));
  };

  const renderHeader = () => {
    return (
      <div className={styles.lessonMaterialsPageHeader}>
        <div className={styles.lessonMaterialsDropdowns}>
          <UnitSelectorV2
            filterToSelectedCourse={true}
            className={styles.unitSelector}
          />
          <LessonSelector
            lessons={lessons}
            selectedLesson={selectedLesson}
            onLessonChange={(lessonId: number) => {
              const lesson = _.find(lessons, {id: lessonId}) || null;
              setSelectedLesson(lesson);
            }}
            hasUnnumberedLessons={hasUnnumberedLessons}
            isLoading={isLoading || isLoadingCoursesWithProgress || needsReload}
            unitName={lessonMaterials?.unitName}
          />
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

  const renderCustomResources = () => {
    if (selectedLesson) {
      return (
        <CustomLessonResources
          unitId={selectedSection.unitId}
          lessonId={selectedLesson.id}
          sectionId={selectedSection.id}
        />
      );
    } else {
      return null;
    }
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
                {audioSummaryTranscript}
              </div>
            }
            className={styles.transcriptDialog}
          />
        )}
        <div className={styles.lessonSummaryContainer}>
          {showAITAPodcasts && (
            <div className={styles.lessonSummarySection}>
              <div className={styles.lessonSummarySectionHeader}>
                <div className={styles.lessonSummarySectionTitle}>
                  <FontAwesomeV6Icon iconName="headphones" iconStyle="solid" />
                  <Typography variant="body2" gutterBottom>
                    {i18n.audioSummary()}
                  </Typography>
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
                  src={`/ai_lesson_summary_podcasts/show?lesson_id=${selectedLesson?.id}`}
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
              <Typography variant="body2" gutterBottom>
                {i18n.teachingTips()}
              </Typography>
            </div>
            <div className={styles.lessonSummaryInfo}>
              <div className={styles.lessonSummaryInfoBlock}>
                <Typography variant="body3" gutterBottom>
                  {i18n.learningObjective()}
                </Typography>
                <Typography variant="body3" gutterBottom>
                  {aiTALessonSummaryInfo?.learning_objective}
                </Typography>
              </div>
              <div className={styles.lessonSummaryInfoBlock}>
                <Typography variant="body3" gutterBottom>
                  {i18n.keyLessonBeats()}
                </Typography>
                <ol>
                  {aiTALessonSummaryInfo?.lesson_beats.map(
                    (lessonBeat, index) => (
                      <li key={`lessonBeat-${index}`}>
                        <Typography variant="body3" gutterBottom>
                          {lessonBeat}
                        </Typography>
                      </li>
                    )
                  )}
                </ol>
              </div>
              <div className={styles.lessonSummaryInfoBlock}>
                <Typography variant="body3" gutterBottom>
                  {i18n.tipsHeader()}
                </Typography>
                <ol>
                  {aiTALessonSummaryInfo?.tips.map((tip, index) => (
                    <li key={`tip-${index}`}>
                      <Typography variant="body3" gutterBottom>
                        {tip}
                      </Typography>
                    </li>
                  ))}
                </ol>
              </div>
              <div className={styles.lessonSummaryInfoBlock}>
                <Typography variant="body3" gutterBottom>
                  {i18n.commonMisconceptions()}
                </Typography>
                <ul>
                  {aiTALessonSummaryInfo?.misconceptions.map(
                    (misconception, index) => (
                      <li key={`misconception-${index}`}>
                        <Typography variant="body3" gutterBottom>
                          {misconception}
                        </Typography>
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
                  <Typography variant="body3" gutterBottom>
                    {i18n.wantToSeeDifferentInformation()}
                  </Typography>
                  <a href="/users/personalization_information">
                    <Typography variant="body3" gutterBottom>
                      {i18n.customizeForYourClassroom()}
                    </Typography>
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className={styles.poweredByAITANote}>
            <img src={AIBotTAIcon} alt="" />
            <Typography variant="body4" gutterBottom>
              {i18n.poweredByAITA()}
            </Typography>
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

  const showSpinner = isLoading || needsReload;

  return (
    <div className={styles.lessonContainer}>
      <div className={styles.lessonMaterialsContainer}>
        {renderHeader()}
        {showSpinner ? (
          <div>
            <Spinner size={'large'} />
          </div>
        ) : (
          <>
            {renderTeacherResources()}
            {renderStudentResources()}
            {renderCustomResources()}
          </>
        )}
      </div>
      {!showSpinner && canShowLessonSummaries && renderLessonSummaryContainer()}
    </div>
  );
};

export default LessonMaterialsContainer;
