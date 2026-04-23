import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useMemo} from 'react';
import {generatePath, useNavigate} from 'react-router-dom';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {toggleSectionHidden} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {Student} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, AppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import LinkOption from './LinkOption';

import styles from './teacherHomepage.module.scss';

export interface SectionOptionsDropdownProps {
  section: Section;
  onDeleteClickCallback: (sectionId: number) => void;
  disabled?: boolean;
  showArchiveAndDelete?: boolean;
  resolveSectionForAction?: (
    eventName: string,
    actionKey:
      | 'settings'
      | 'roster'
      | 'loginCards'
      | 'certificates'
      | 'archive'
      | 'delete'
  ) => Promise<Section>;
}

const CERTIFICATE_URL = '/certificates/batch';

const onArchiveClick = (dispatch: AppDispatch, section: Section) => {
  const hideShowEvent = section.hidden
    ? EVENTS.SECTION_CARD_RESTORE_CLICKED
    : EVENTS.SECTION_CARD_ARCHIVE_CLICKED;
  analyticsReporter.sendEvent(hideShowEvent, {});
  dispatch(toggleSectionHidden(section.id));
};

const onDeleteClick = (
  onDeleteClickCallback: (sectionId: number) => void,
  sectionId: number
) => {
  analyticsReporter.sendEvent(EVENTS.SECTION_CARD_DELETE_CLICKED, {});
  onDeleteClickCallback(sectionId);
};

const SectionOptionsDropdown: React.FC<SectionOptionsDropdownProps> = ({
  section,
  onDeleteClickCallback,
  disabled = false,
  showArchiveAndDelete = true,
  resolveSectionForAction,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const certFormRef = React.useRef<HTMLFormElement>(null);

  const [studentNames, setStudentNames] = React.useState<string[]>([]);
  const [certificateCourse, setCertificateCourse] = React.useState<
    string | undefined
  >(section.courseVersionName);
  const [pendingActionKey, setPendingActionKey] = React.useState<string | null>(
    null
  );

  const navigateToSectionPath = React.useCallback(
    (sectionId: number, path: string) => {
      const nextPath = path.includes(':sectionId')
        ? generatePath(path, {sectionId: sectionId.toString()})
        : path.startsWith('/')
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

  const withResolvedSection = React.useCallback(
    async (
      actionKey:
        | 'settings'
        | 'roster'
        | 'loginCards'
        | 'certificates'
        | 'archive'
        | 'delete',
      eventName: string,
      callback: (resolvedSection: Section) => Promise<void> | void
    ) => {
      if (!resolveSectionForAction || pendingActionKey || disabled) {
        return;
      }

      setPendingActionKey(actionKey);
      try {
        const resolvedSection = await resolveSectionForAction(
          eventName,
          actionKey
        );
        await callback(resolvedSection);
      } finally {
        setPendingActionKey(null);
      }
    },
    [disabled, pendingActionKey, resolveSectionForAction]
  );

  const onClickPrintCerts = React.useCallback((targetSection: Section) => {
    HttpClient.fetchJson<Student[]>(
      `/dashboardapi/sections/${targetSection.id}/students`
    )
      .then(result => result.value)
      .then(value => {
        const names = value.map((student: {name: string}) => student.name);
        setStudentNames(names);
        setCertificateCourse(targetSection.courseVersionName);
        certFormRef.current?.submit();
      })
      .catch(error =>
        console.error('Error retrieving student names for certificates', error)
      );
  }, []);

  const dropdownOptions = useMemo(() => {
    const options = [
      resolveSectionForAction ? (
        <li key={'sectionSettings'}>
          <button
            type="button"
            className={styles.dropdownMenuItem}
            disabled={disabled || !!pendingActionKey}
            onClick={() =>
              withResolvedSection(
                'settings',
                EVENTS.SECTION_CARD_SETTINGS_CLICKED,
                resolvedSection =>
                  navigateToSectionPath(
                    resolvedSection.id,
                    TEACHER_NAVIGATION_PATHS.settings
                  )
              )
            }
          >
            <FontAwesomeV6Icon iconName="gear" iconStyle="solid" />
            <span>{i18n.sectionSettings()}</span>
          </button>
        </li>
      ) : (
        <LinkOption
          key={'sectionSettings'}
          value={TEACHER_NAVIGATION_PATHS.settings}
          label={i18n.sectionSettings()}
          iconName={'gear'}
          url={`../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.settings}`}
          eventName={EVENTS.SECTION_CARD_SETTINGS_CLICKED}
          eventOptions={{}}
        />
      ),
      resolveSectionForAction ? (
        <li key={'roster'}>
          <button
            type="button"
            className={styles.dropdownMenuItem}
            disabled={disabled || !!pendingActionKey}
            onClick={() =>
              withResolvedSection(
                'roster',
                EVENTS.SECTION_CARD_ROSTER_CLICKED,
                resolvedSection =>
                  navigateToSectionPath(
                    resolvedSection.id,
                    TEACHER_NAVIGATION_PATHS.roster
                  )
              )
            }
          >
            <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
            <span>{i18n.roster()}</span>
          </button>
        </li>
      ) : (
        <LinkOption
          key={'roster'}
          value={TEACHER_NAVIGATION_PATHS.roster}
          label={i18n.roster()}
          iconName={'user'}
          url={`../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.roster}`}
          eventName={EVENTS.SECTION_CARD_ROSTER_CLICKED}
          eventOptions={{}}
        />
      ),
      resolveSectionForAction ? (
        <li key={'loginCards'}>
          <button
            type="button"
            className={styles.dropdownMenuItem}
            disabled={disabled || !!pendingActionKey}
            onClick={() =>
              withResolvedSection(
                'loginCards',
                EVENTS.SECTION_CARD_LOGIN_CARDS_CLICKED,
                resolvedSection =>
                  navigateToSectionPath(
                    resolvedSection.id,
                    TEACHER_NAVIGATION_PATHS.loginInfo
                  )
              )
            }
          >
            <FontAwesomeV6Icon iconName="id-card" iconStyle="solid" />
            <span>{i18n.loginCards()}</span>
          </button>
        </li>
      ) : (
        <LinkOption
          key={'loginCards'}
          value={TEACHER_NAVIGATION_PATHS.loginInfo}
          label={i18n.loginCards()}
          iconName={'id-card'}
          url={`../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.loginInfo}`}
          eventName={EVENTS.SECTION_CARD_LOGIN_CARDS_CLICKED}
          eventOptions={{}}
        />
      ),
      <li key={'certificates'}>
        <button
          id="ui-test-print-certificates"
          type="button"
          className={styles.dropdownMenuItem}
          disabled={disabled || !!pendingActionKey}
          onClick={() => {
            if (resolveSectionForAction) {
              return withResolvedSection(
                'certificates',
                EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
                onClickPrintCerts
              );
            }

            analyticsReporter.sendEvent(
              EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
              {}
            );
            return onClickPrintCerts(section);
          }}
        >
          <FontAwesomeV6Icon iconName="file-certificate" iconStyle="solid" />
          <Typography variant="body2" component="span">
            {i18n.certificates()}
          </Typography>
        </button>
      </li>,
    ];

    if (showArchiveAndDelete) {
      options.push(
        <li key={'archive'}>
          <button
            id="ui-test-archive-section"
            type="button"
            className={styles.dropdownMenuItem}
            disabled={disabled || !!pendingActionKey}
            onClick={() =>
              resolveSectionForAction
                ? withResolvedSection(
                    'archive',
                    section.hidden
                      ? EVENTS.SECTION_CARD_RESTORE_CLICKED
                      : EVENTS.SECTION_CARD_ARCHIVE_CLICKED,
                    resolvedSection =>
                      dispatch(toggleSectionHidden(resolvedSection.id))
                  )
                : onArchiveClick(dispatch, section)
            }
          >
            <FontAwesomeV6Icon
              iconName={section.hidden ? 'window-restore' : 'box-archive'}
              iconStyle="solid"
            />
            <Typography variant="body2" component="span">
              {section.hidden ? i18n.restoreClassSection() : i18n.archive()}
            </Typography>
          </button>
        </li>
      );
    }

    if (showArchiveAndDelete && section.studentCount === 0) {
      options.push(
        <li key={'delete'}>
          <button
            id="ui-test-delete-section"
            type="button"
            className={styles.dropdownMenuItem}
            disabled={disabled || !!pendingActionKey}
            onClick={() =>
              resolveSectionForAction
                ? withResolvedSection(
                    'delete',
                    EVENTS.SECTION_CARD_DELETE_CLICKED,
                    resolvedSection => onDeleteClickCallback(resolvedSection.id)
                  )
                : onDeleteClick(onDeleteClickCallback, section.id)
            }
          >
            <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
            <Typography variant="body2" component="span">
              {i18n.delete()}
            </Typography>
          </button>
        </li>
      );
    }
    return options;
  }, [
    section,
    dispatch,
    navigateToSectionPath,
    onDeleteClickCallback,
    onClickPrintCerts,
    pendingActionKey,
    disabled,
    showArchiveAndDelete,
    resolveSectionForAction,
    withResolvedSection,
  ]);

  return (
    <form ref={certFormRef} action={CERTIFICATE_URL} method="POST">
      <RailsAuthenticityToken />
      {certificateCourse && (
        <input type="hidden" name="course" value={btoa(certificateCourse)} />
      )}
      {studentNames.map((name, index) => (
        <input key={index} type="hidden" name="names[]" value={name} />
      ))}
      <CustomDropdown
        name="section-options-dropdown"
        labelText="Section Options"
        menuPlacement="right"
        size="m"
        useMuiIconButtonAsTrigger={true}
        triggerButtonProps={{
          children: (
            <FontAwesomeV6Icon iconName="ellipsis-vertical" iconStyle="solid" />
          ),
          color: 'tertiary',
          variant: 'text',
          size: 'small',
          className: styles.dropdownButton,
          'aria-label': i18n.sectionOptionsDropdown(),
          disabled: disabled || !!pendingActionKey,
        }}
      >
        <ul>{dropdownOptions}</ul>
      </CustomDropdown>
    </form>
  );
};

export default SectionOptionsDropdown;
