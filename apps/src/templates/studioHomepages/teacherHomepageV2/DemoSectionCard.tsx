import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton, Typography} from '@mui/material';
import React from 'react';
import {generatePath, useNavigate} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import DemoStudentChip from '@cdo/apps/templates/DemoStudentChip';
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
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {CourseContentDropdown} from './CourseContentDropdown';
import SectionAvatar from './sectionAvatars/SectionAvatar';

import joinLinkStyles from './JoinLink/joinLinkCopyButton.module.scss';
import styles from './teacherHomepage.module.scss';

type Notice = {
  text: string;
  type: 'warning' | 'danger';
};

interface DemoSectionCardProps {
  preset: DemoPresetView;
  demoType: DemoType;
  onNotice: (notice: Notice | null) => void;
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

const DemoSectionCard: React.FC<DemoSectionCardProps> = ({
  preset,
  demoType,
  onNotice,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);
  const primaryActions = React.useMemo(
    () => buildPrimaryActions(preset),
    [preset]
  );
  const demoSection = React.useMemo<Section>(() => {
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
      aiTutorEnabled: false,
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
    onNotice(null);
    analyticsReporter.sendEvent(eventName, {});

    try {
      const section = await dispatch(createDemoSection(demoType));
      const nextPath = path.includes(':sectionId')
        ? generatePath(path, {sectionId: section.id.toString()})
        : path.startsWith('/')
        ? path
        : generatePath(
            `${TEACHER_NAVIGATION_SECTIONS_URL}/:sectionId/${path}`,
            {
              sectionId: section.id.toString(),
            }
          );
      navigate(nextPath);
    } catch (error) {
      if (error instanceof DemoSectionCreationError) {
        onNotice({
          text: error.message,
          type: error.code === 'conflict' ? 'warning' : 'danger',
        });
      } else {
        onNotice({
          text: "Couldn't create your practice section.",
          type: 'danger',
        });
      }
    } finally {
      setPendingPath(null);
    }
  };

  return (
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
            <FontAwesomeV6Icon iconName="ellipsis-vertical" iconStyle="solid" />
          </MuiIconButton>
        </div>
      </div>
      <div className={styles.sectionCardBody}>
        <div className={styles.sectionCardBodyLeft}>
          <CourseContentDropdown
            section={demoSection}
            demoType={demoType}
            disabled={!!pendingPath}
            onNavigateToPath={(path, eventName) =>
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
                  handleActionClick(action.path, action.eventName, action.id)
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
  );
};

export default DemoSectionCard;
