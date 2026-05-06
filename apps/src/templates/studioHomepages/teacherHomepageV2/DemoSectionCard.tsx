import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton, Typography} from '@mui/material';
import React from 'react';
import {generatePath, useNavigate} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import DemoChip from '@cdo/apps/templates/DemoChip';
import {
  createDemoSection,
  DemoSectionCreationError,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  DemoPresetView,
  DemoType,
  Section,
} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_SECTIONS_URL,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {DemoSectionCourseContentDropdown} from './DemoSectionCourseContentDropdown';
import DemoSectionOptionsDropdown from './DemoSectionOptionsDropdown';
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
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const pendingActionRef = React.useRef<string | null>(null);
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

  const createSectionForAction = React.useCallback(
    async (eventName: string, pendingKey: string) => {
      if (pendingActionRef.current) {
        return;
      }

      pendingActionRef.current = pendingKey;
      setPendingPath(pendingKey);
      setNotice(null);
      analyticsReporter.sendEvent(eventName, {});

      try {
        const section = await dispatch(createDemoSection(demoType as DemoType));
        if (!section) {
          return;
        }

        return section;
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
        throw error;
      } finally {
        pendingActionRef.current = null;
        setPendingPath(null);
      }
    },
    [demoType, dispatch]
  );

  const navigateToSectionPath = React.useCallback(
    (sectionId: number, path: string) => {
      const nextPath = path.startsWith('/')
        ? path
        : generatePath(
            `${TEACHER_NAVIGATION_SECTIONS_URL}/:sectionId/${path}`,
            {
              sectionId: sectionId.toString(),
            }
          );
      navigate(nextPath);
    },
    [navigate]
  );

  const handleNavigationClick = React.useCallback(
    async (path: string, eventName: string, pendingKey = path) => {
      try {
        const section = await createSectionForAction(eventName, pendingKey);
        if (!section) {
          return;
        }
        navigateToSectionPath(section.id, path);
      } catch {
        // Errors are handled by createSectionForAction via the notice banner.
      }
    },
    [createSectionForAction, navigateToSectionPath]
  );

  if (numSections !== 0) {
    return null;
  }

  if (isLoadingDemoCard) {
    return <Spinner size="large" />;
  }

  if (totalSections !== 0 || !preset || !demoSection) {
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
                  <Typography component="span" variant="h5">
                    <DemoChip />
                  </Typography>
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
              <DemoSectionOptionsDropdown
                disabled={!!pendingPath}
                section={demoSection}
                handleNavigationClick={handleNavigationClick}
                createSectionForAction={createSectionForAction}
              />
            </div>
          </div>
          <div className={styles.sectionCardBody}>
            <div className={styles.sectionCardBodyLeft}>
              <DemoSectionCourseContentDropdown
                section={demoSection}
                demoType={demoType as DemoType}
                disabled={!!pendingPath}
                beforeNavigate={handleNavigationClick}
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
                      handleNavigationClick(
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
