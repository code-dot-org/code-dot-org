import React from 'react';
import {useSelector} from 'react-redux';

import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
import {getStore} from '@cdo/apps/redux';
import {Version} from '@cdo/apps/templates/courseOverview/TeacherCourseOverview';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import MultipleAssignButton from '@cdo/apps/templates/MultipleAssignButton';
import AssignmentVersionSelector from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {
  isOnTeacherDashboard,
  showV2TeacherDashboard,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavFlagUtils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {setViewAsUserId} from '../../progressRedux';
import {updateQueryParam} from '../../utils';
import {changeViewType, ViewType} from '../../viewAsRedux';

import ResourcesDropdown from './ResourcesDropdown';

import styles from './unit-overview.module.scss';

interface TeacherResource {
  id: number;
  key: string;
  markdownKey: string;
  name: string;
  url: string;
  type: string;
  audience: string;
  assessment: boolean;
  includeInPdf: boolean;
  downloadUrl: string;
  isRollup: boolean;
}

interface DropdownSection {
  id: number;
  name: string;
  isAssigned: boolean;
}

interface UnitOverviewActionRowProps {
  courseVersionId: number;
  versions: Version[];
  showAssignButton: boolean;
  currentCourseId: number;
  courseOfferingId: number;
  courseLink: string;
  participantAudience: string;
  isMigrated: boolean;
  scriptOverviewPdfUrl: string;
  scriptResourcesPdfUrl: string;
  publishedState: string;
  teacherResources: TeacherResource[];
}

const compilePdfDropdownOptions = (
  scriptOverviewPdfUrl: string,
  scriptResourcesPdfUrl: string
) => {
  const options = [];
  if (scriptOverviewPdfUrl) {
    options.push({
      key: 'lessonPlans',
      name: i18n.printLessonPlans(),
      url: scriptOverviewPdfUrl,
    });
  }
  if (scriptResourcesPdfUrl) {
    options.push({
      key: 'scriptResources',
      name: i18n.printHandouts(),
      url: scriptResourcesPdfUrl,
    });
  }
  return options;
};

const recordAndNavigateToPdf = (
  e: React.MouseEvent,
  firehoseKey: string,
  url: string,
  scriptName: string
) => {
  e.preventDefault();
  firehoseClient.putRecord(
    {
      study: 'pdf-click',
      study_group: 'script',
      event: 'open-pdf',
      data_json: JSON.stringify({
        name: scriptName,
        pdfType: firehoseKey,
      }),
    },
    {
      includeUserId: true,
      callback: () => {
        window.location.href = url;
      },
    }
  );
};

const UnitOverviewActionRow: React.FC<UnitOverviewActionRowProps> = ({
  courseVersionId,
  versions,
  showAssignButton,
  currentCourseId,
  courseOfferingId,
  courseLink,
  participantAudience,
  isMigrated,
  scriptOverviewPdfUrl,
  scriptResourcesPdfUrl,
  publishedState,
  teacherResources,
}) => {
  const [confirmationMessageOpen, setConfirmationMessageOpen] =
    React.useState(false);

  const sections = useAppSelector(state =>
    sectionsForDropdown(
      state.teacherSections,
      courseOfferingId,
      courseVersionId,
      state.progress.scriptId
    )
  ) as DropdownSection[];

  const {unitTitle, unitName, scriptId, deeperLearningCourse} = useAppSelector(
    state => ({
      unitTitle: state.progress.unitTitle,
      unitName: state.progress.scriptName,
      scriptId: state.progress.scriptId,
      deeperLearningCourse: state.progress.deeperLearningCourse,
    })
  );
  const viewAs = useSelector(
    (state: {viewAs: keyof typeof ViewType}) => state.viewAs
  ) as string;
  const selectedSectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId
  );

  const pdfDropdownOptions = compilePdfDropdownOptions(
    scriptOverviewPdfUrl,
    scriptResourcesPdfUrl
  );

  const onChangeVersion = (versionId: number) => {
    const version = versions[versionId];
    if (versionId !== courseVersionId && version) {
      const queryParams = window.location.search || '';
      window.location.href = `${version.path}${queryParams}`;
    }
  };

  const onReassignConfirm = () => {
    setConfirmationMessageOpen(true);
    setTimeout(() => {
      setConfirmationMessageOpen(false);
    }, 15000);
  };

  const viewAsToggleAction = (viewType: string) => {
    if (!isOnTeacherDashboard()) {
      updateQueryParam('viewAs', viewType);
    }

    if (viewType === ViewType.Participant) {
      getStore().dispatch(setViewAsUserId(null));
    }
    getStore().dispatch(changeViewType(viewType, true));

    analyticsReporter.sendEvent('unit_overview_toggle_viewAs', {
      viewType,
    });
  };

  const selectedSection = React.useMemo(
    () => sections.find(section => section.id === selectedSectionId),
    [sections, selectedSectionId]
  );

  const displayPrintingOptionsDropdown =
    pdfDropdownOptions.length > 0 &&
    publishedState !== PublishedState.pilot &&
    publishedState !== PublishedState.in_development;

  return (
    <div>
      {confirmationMessageOpen && (
        <span className={styles.confirmText}>{i18n.assignSuccess()}</span>
      )}
      <div className={styles.actionRow}>
        <div className={styles.leftActions}>
          {Object.values(versions).length > 1 && (
            <div className={styles.versionSelector}>
              <AssignmentVersionSelector
                onChangeVersion={onChangeVersion}
                courseVersions={versions}
                rightJustifiedPopupMenu={true}
                selectedCourseVersionId={courseVersionId}
              />
            </div>
          )}
          {!deeperLearningCourse &&
            viewAs === ViewType.Instructor &&
            isMigrated &&
            teacherResources.length > 0 && (
              <div className={styles.teacherResources}>
                <ResourcesDropdown
                  resources={teacherResources}
                  unitId={scriptId}
                />
              </div>
            )}
          {displayPrintingOptionsDropdown && viewAs === ViewType.Instructor && (
            <div className={styles.printingOptions}>
              <DropdownButton
                customText={
                  <div>
                    <span className={styles.customText}>
                      {i18n.printingOptions()}
                    </span>
                  </div>
                }
                color={Button.ButtonColor.blue}
              >
                {pdfDropdownOptions.map(option => (
                  <a
                    key={option.key}
                    href={option.url}
                    onClick={e =>
                      recordAndNavigateToPdf(
                        e,
                        option.key,
                        option.url,
                        unitName || ''
                      )
                    }
                  >
                    {option.name}
                  </a>
                ))}
              </DropdownButton>
            </div>
          )}

          {selectedSection && showAssignButton && (
            <div className={styles.assignButton}>
              <MultipleAssignButton
                courseOfferingId={courseOfferingId}
                courseVersionId={courseVersionId}
                courseId={currentCourseId}
                scriptId={scriptId}
                assignmentName={unitTitle}
                reassignConfirm={onReassignConfirm}
                isAssigningCourse={false}
                isStandAloneUnit={courseLink === null}
                participantAudience={participantAudience}
              />
            </div>
          )}
        </div>

        {showV2TeacherDashboard() && (
          <div className={styles.viewAs}>
            {<label className={styles.viewAsLabel}>{i18n.viewPageAs()}</label>}
            <SegmentedButtons
              buttons={[
                {
                  label: i18n.student(),
                  value: ViewType.Participant,
                },
                {
                  label: i18n.teacher(),
                  value: ViewType.Instructor,
                },
              ]}
              onChange={viewAsToggleAction}
              selectedButtonValue={viewAs}
              size="s"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitOverviewActionRow;
