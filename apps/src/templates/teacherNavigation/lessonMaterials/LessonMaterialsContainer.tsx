import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyTwoText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import _ from 'lodash';
import React, {useState, useMemo, useCallback} from 'react';
import {useSelector} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  asyncLoadCoursesWithProgress,
  getSelectedUnitId,
} from '@cdo/apps/redux/unitSelectionRedux';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import UnitSelectorV2 from '../../UnitSelectorV2';

import {LessonMaterialsEmptyState} from './LessonMaterialsEmptyState';
import {Lesson} from './LessonMaterialTypes';
import LessonResources from './LessonResources';
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
      <div className={styles.lessonSummaryContainer}>
        <div className={styles.lessonSummarySection}>
          <div className={styles.lessonSummarySectionTitle}>
            <FontAwesomeV6Icon iconName="headphones" iconStyle="solid" />
            <BodyTwoText>{i18n.audioSummary()}</BodyTwoText>
          </div>
          {/* <audio controls src="" type="audio/mpeg" /> */}
          <p>AUDIO PLAYER HERE</p>
        </div>
        <div className={styles.lessonSummarySection}>
          <div className={styles.lessonSummarySectionTitle}>
            <FontAwesomeV6Icon iconName="lightbulb" iconStyle="solid" />
            <BodyTwoText>{i18n.teachingTips()}</BodyTwoText>
          </div>
          <div className={styles.lessonSummaryInfo}>
            <div className={styles.lessonSummaryInfoBlock}>
              <BodyThreeText>{i18n.learningObjective()}</BodyThreeText>
              <BodyThreeText>
                Students will use parameters to control the size and placement
                of shapes, learning that parameters let us give more precise
                instructions to the computer.
              </BodyThreeText>
            </div>
            <div className={styles.lessonSummaryInfoBlock}>
              <BodyThreeText>{i18n.keyLessonBeats()}</BodyThreeText>
              <ol>
                <li>
                  <BodyThreeText>
                    Warm-up brainstorm on “extra details” for rectangles.
                  </BodyThreeText>
                </li>
                <li>
                  <BodyThreeText>Introduce vocabulary parameter.</BodyThreeText>
                </li>
                <li>
                  <BodyThreeText>
                    Code Studio activity—test and debug.
                  </BodyThreeText>
                </li>
                <li>
                  <BodyThreeText>
                    Wrap-up reflection: other uses for parameters.
                  </BodyThreeText>
                </li>
              </ol>
            </div>
            <div className={styles.lessonSummaryInfoBlock}>
              <BodyThreeText>{i18n.commonMisconceptions()}</BodyThreeText>
              <ul>
                <li>
                  <BodyThreeText>
                    Students may confuse x/y position with width/height. Use
                    visuals: draw arrows for position, then outline size
                    separately.
                  </BodyThreeText>
                </li>
                <li>
                  <BodyThreeText>Introduce vocabulary parameter.</BodyThreeText>
                </li>
                <li>
                  <BodyThreeText>
                    Some think order doesn't matter—remind them code runs top to
                    bottom.
                  </BodyThreeText>
                </li>
              </ul>
            </div>
          </div>
          <Button
            id="lesson-summary-ask-aita"
            type="secondary"
            color="black"
            className={styles.askAITAButton}
            text={i18n.questionForAITA()}
            onClick={() => console.log('ASK TA')}
          />
          <div className={styles.horizontalLine} />
          <div className={styles.personalizationQuizPrompt}>
            <BodyThreeText>
              {i18n.wantToSeeDifferentInformation()}
            </BodyThreeText>
            <a href="">
              <BodyThreeText>{i18n.customizeForYourClassroom()}</BodyThreeText>
            </a>
          </div>
        </div>
        <div className={styles.poweredByAITANote}>
          <p>the little AI TA icon and message</p>
        </div>
      </div>
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
      {renderLessonSummaryContainer()}
    </div>
  );
};

export default LessonMaterialsContainer;
