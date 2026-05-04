import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton, Typography} from '@mui/material';
import React from 'react';
import {generatePath} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import DemoStudentChip from '@cdo/apps/templates/DemoStudentChip';
import {
  createDemoSection,
  DemoSectionCreationError,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  DemoPresetView,
  Section,
} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  getBasePath,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {DemoSectionCourseContentDropdown} from './DemoSectionCourseContentDropdown';
import {EmptyHomepage} from './EmptyHomepage';
import {pickDemoType} from './pickDemoType';
import SectionAvatar from './sectionAvatars/SectionAvatar';

import joinLinkStyles from './JoinLink/joinLinkCopyButton.module.scss';
import styles from './teacherHomepage.module.scss';

type Notice = {
  text: string;
  type: 'warning' | 'danger';
};

interface DemoSectionCardProps {
  showHiddenOnly: boolean;
}

interface DemoAction {
  id: string;
  buttonText: string;
  icon: string;
  path: string;
  eventName: string;
}

const buildPrimaryActions = (preset: DemoPresetView): DemoAction[] => {
  const actions: DemoAction[] = [];

  if (preset.unitGroup || preset.unit) {
    actions.push({
      id: 'progress',
      buttonText: i18n.viewProgressButton(),
      icon: 'chart-line',
      path: TEACHER_NAVIGATION_PATHS.progress,
      eventName: EVENTS.SECTION_CARD_VIEW_PROGRESS_CLICKED,
    });
  }

  if (preset.unit) {
    actions.push({
      id: 'materials',
      buttonText: i18n.viewLessonMaterialsButton(),
      icon: 'folder-open',
      path: TEACHER_NAVIGATION_PATHS.lessonMaterials,
      eventName: EVENTS.SECTION_CARD_VIEW_LESSON_MATERIALS_CLICKED,
    });
  }

  return actions;
};

const DemoSectionCard: React.FC<DemoSectionCardProps> = ({showHiddenOnly}) => {
  const dispatch = useAppDispatch();
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const gradesTeaching = useAppSelector(
    state => state.currentUser.gradesTeaching
  );
  const sections = useAppSelector(state => state.teacherSections.sections);
  const demoPresets = useAppSelector(
    state => state.teacherSections.demoPresets
  );
  const demoPresetsAreLoaded = useAppSelector(
    state => state.teacherSections.demoPresetsAreLoaded
  );
  const demoType = React.useMemo(
    () => pickDemoType(gradesTeaching),
    [gradesTeaching]
  );
  const preset = demoPresets[demoType];
  const totalSections = Object.keys(sections).length;
  const numSections = React.useMemo(
    () =>
      Object.values(sections).filter(
        section => showHiddenOnly === section.hidden
      ).length,
    [sections, showHiddenOnly]
  );
  const isLoadingDemoCard = totalSections === 0 && !demoPresetsAreLoaded;
  const primaryActions = React.useMemo(
    () => (preset ? buildPrimaryActions(preset) : []),
    [preset]
  );
  const demoSection = React.useMemo<Section | null>(() => {
    if (!preset) {
      return null;
    }
    const courseDisplayName: string | null =
      preset.unitGroup?.displayName ?? preset.unit?.displayName ?? null;

    return {
      id: 0,
      name: preset.sectionName,
      code: 'DEMO-123',
      hidden: false,
      courseDisplayName,
      courseVersionName: preset.unitGroup?.name,
      unitId: preset.unit ? -1 : null,
      unitName: preset.unit?.name || null,
      unitPosition: null,
      studentCount: 3,
      participantType: preset.participantType,
      loginType: preset.loginType as Section['loginType'],
      grades: [],
      lessonExtras: false,
      pairingAllowed: true,
      providerManaged: false,
      restrictSection: false,
      sharingDisabled: false,
      ttsAutoplayEnabled: false,
      avatar_color: preset.avatarColor,
      avatar_emoji: preset.avatarEmoji,
    };
  }, [preset]);

  const handleActionClick = async (
    path: string,
    eventName: string,
    pendingKey?: string
  ) => {
    if (pendingPath) {
      return;
    }

    setPendingPath(pendingKey || path);
    setNotice(null);
    analyticsReporter.sendEvent(eventName, {});

    try {
      const section = await dispatch(createDemoSection(demoType));
      if (!section) {
        return;
      }
      const nextPath = path.startsWith('/')
        ? path
        : generatePath(getBasePath(path), {sectionId: section.id.toString()});

      window.location.assign(nextPath);
    } catch (error) {
      if (error instanceof DemoSectionCreationError) {
        setNotice({
          text: error.message,
          type: error.errorType === 'conflict' ? 'warning' : 'danger',
        });
      } else {
        setNotice({
          text: "Couldn't create your practice section.",
          type: 'danger',
        });
      }
    } finally {
      setPendingPath(null);
    }
  };

  if (numSections !== 0) {
    return null;
  }

  if (isLoadingDemoCard) {
    return <Spinner size="large" />;
  }

  if (totalSections !== 0 || !preset) {
    return <EmptyHomepage showHiddenOnly={showHiddenOnly} />;
  }

  return (
    <>
      {notice && (
        <Alert
          type={
            notice.type === 'warning' ? alertTypes.warning : alertTypes.danger
          }
          text={notice.text}
          className={styles.notificationBanner}
          onClose={() => setNotice(null)}
        />
      )}
      <ul className={styles.sectionList}>
        <li
          id="ui-test-demo-section-card"
          className={styles.sectionCardWrapper}
          aria-labelledby="demo-section-card-title"
        >
          <div className={styles.sectionCardHeader}>
            <div className={styles.sectionCardHeaderLeft}>
              <MuiIconButton
                variant="text"
                color="tertiary"
                size="small"
                onClick={() => {}}
                aria-label={i18n.dragSection()}
                type="button"
                disabled={true}
              >
                <FontAwesomeV6Icon iconName="grip-vertical" />
              </MuiIconButton>
              <SectionAvatar
                color={preset.avatarColor}
                emoji={preset.avatarEmoji}
                size={'s'}
              />
              <div className={styles.sectionCardHeaderText}>
                <div className={styles.demoSectionTitleRow}>
                  <Typography
                    id="demo-section-card-title"
                    variant="h5"
                    gutterBottom
                  >
                    {preset.sectionName}
                  </Typography>
                  <DemoStudentChip />
                </div>
                <div
                  className={joinLinkStyles.sectionCodeBox}
                  data-for="section-code"
                  data-tip
                >
                  <span className={joinLinkStyles.sectionCodeText}>
                    <Typography variant="overline1" gutterBottom>
                      <span>{i18n.sectionCodeWithColon()}</span>{' '}
                      <span className={joinLinkStyles.sectionCodeTextHidden}>
                        DEMO-123
                      </span>
                    </Typography>
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.sectionCardHeaderRight}>
              <MuiIconButton
                variant="text"
                color="tertiary"
                size="small"
                className={styles.dropdownButton}
                aria-label={i18n.sectionOptionsDropdown()}
                disabled={true}
              >
                <FontAwesomeV6Icon
                  iconName="ellipsis-vertical"
                  iconStyle="solid"
                />
              </MuiIconButton>
            </div>
          </div>
          <div className={styles.sectionCardBody}>
            <div className={styles.sectionCardBodyLeft}>
              <DemoSectionCourseContentDropdown
                section={demoSection!}
                demoType={demoType}
                disabled={!!pendingPath}
                beforeNavigate={(path: string, eventName: string) =>
                  handleActionClick(path, eventName, path)
                }
              />
            </div>
            <div className={styles.sectionCardBodyRight}>
              {primaryActions.map(action => {
                const isPending = pendingPath === action.id;
                return (
                  <button
                    id={`ui-test-demo-section-action-${action.id}`}
                    key={action.id}
                    type="button"
                    className={styles.demoActionButton}
                    disabled={!!pendingPath}
                    onClick={() =>
                      handleActionClick(
                        action.path,
                        action.eventName,
                        action.id
                      )
                    }
                  >
                    <div className={styles.taskButtonLeft}>
                      <FontAwesomeV6Icon
                        className={styles.taskButtonIcons}
                        iconName={action.icon}
                        iconStyle={'solid'}
                      />
                      <Typography variant="body3" gutterBottom>
                        {isPending
                          ? 'Creating practice section...'
                          : action.buttonText}
                      </Typography>
                    </div>
                    <FontAwesomeV6Icon
                      className={styles.taskButtonArrow}
                      iconName={'arrow-right'}
                      iconStyle={'solid'}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </li>
      </ul>
    </>
  );
};

export default DemoSectionCard;
