import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import React, {useMemo} from 'react';
import {useNavigate, NavigateFunction} from 'react-router-dom';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
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

import styles from './teacherHomepage.module.scss';

export interface SectionOptionsDropdownProps {
  section: Section;
  onDeleteClickCallback: (sectionId: number) => void;
}

const CERTIFICATE_URL = '/certificates/batch';

const onSectionSettingsClick = (
  navigate: NavigateFunction,
  sectionId: number
) => {
  analyticsReporter.sendEvent(
    EVENTS.SECTION_CARD_SETTINGS_CLICKED,
    {},
    PLATFORMS.BOTH
  );
  navigate(
    `../${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${TEACHER_NAVIGATION_PATHS.settings}`
  );
};

const onRosterClick = (navigate: NavigateFunction, sectionId: number) => {
  analyticsReporter.sendEvent(
    EVENTS.SECTION_CARD_ROSTER_CLICKED,
    {},
    PLATFORMS.BOTH
  );
  navigate(
    `../${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${TEACHER_NAVIGATION_PATHS.roster}`
  );
};

const onLoginCardsClick = (navigate: NavigateFunction, sectionId: number) => {
  analyticsReporter.sendEvent(
    EVENTS.SECTION_CARD_LOGIN_CARDS_CLICKED,
    {},
    PLATFORMS.BOTH
  );
  navigate(
    `../${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${TEACHER_NAVIGATION_PATHS.loginInfo}`
  );
};

const onArchiveClick = (dispatch: AppDispatch, section: Section) => {
  const hideShowEvent = section.hidden
    ? EVENTS.SECTION_CARD_RESTORE_CLICKED
    : EVENTS.SECTION_CARD_ARCHIVE_CLICKED;
  analyticsReporter.sendEvent(hideShowEvent, {}, PLATFORMS.BOTH);
  dispatch(toggleSectionHidden(section.id));
};

const onDeleteClick = (
  onDeleteClickCallback: (sectionId: number) => void,
  sectionId: number
) => {
  analyticsReporter.sendEvent(
    EVENTS.SECTION_CARD_DELETE_CLICKED,
    {},
    PLATFORMS.BOTH
  );
  onDeleteClickCallback(sectionId);
};

export const SectionOptionsDropdown: React.FC<SectionOptionsDropdownProps> = ({
  section,
  onDeleteClickCallback,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const certFormRef = React.useRef<HTMLFormElement>(null);

  const [studentNames, setStudentNames] = React.useState<string[]>([]);

  const onClickPrintCerts = React.useCallback(() => {
    analyticsReporter.sendEvent(
      EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
      {},
      PLATFORMS.BOTH
    );
    HttpClient.fetchJson<Student[]>(
      `/dashboardapi/sections/${section.id}/students`
    )
      .then(result => result.value)
      .then(value => {
        const names = value.map((student: {name: string}) => student.name);
        setStudentNames(names);
        certFormRef.current?.submit();
      })
      .catch(error =>
        console.error('Error retrieving student names for certificates', error)
      );
  }, [section.id]);

  const dropdownOptions: ActionDropdownOption[] = useMemo(() => {
    const options: ActionDropdownOption[] = [
      {
        value: 'sectionSettings',
        label: i18n.sectionSettings(),
        icon: {iconName: 'gear', iconStyle: 'solid'},
        onClick: () => onSectionSettingsClick(navigate, section.id),
      },
      {
        value: 'roster',
        label: i18n.roster(),
        icon: {iconName: 'user', iconStyle: 'solid'},

        onClick: () => onRosterClick(navigate, section.id),
      },
      {
        value: 'loginCards',
        label: i18n.loginCards(),
        icon: {iconName: 'id-card', iconStyle: 'solid'},
        onClick: () => onLoginCardsClick(navigate, section.id),
      },
      {
        value: 'certificates',
        label: i18n.certificates(),
        icon: {iconName: 'file-certificate', iconStyle: 'solid'},
        onClick: () => onClickPrintCerts(),
      },
      {
        value: section.hidden ? 'restore' : 'archive',
        label: section.hidden ? i18n.restoreClassSection() : i18n.archive(),
        icon: {
          iconName: section.hidden ? 'window-restore' : 'box-archive',
          iconStyle: 'solid',
        },
        onClick: () => onArchiveClick(dispatch, section),
      },
    ];

    if (section.studentCount === 0) {
      options.push({
        value: 'delete',
        label: i18n.delete(),
        icon: {iconName: 'trash', iconStyle: 'solid'},
        onClick: () => onDeleteClick(onDeleteClickCallback, section.id),
      });
    }
    return options;
  }, [section, dispatch, navigate, onDeleteClickCallback, onClickPrintCerts]);

  return (
    <form ref={certFormRef} action={CERTIFICATE_URL} method="POST">
      <RailsAuthenticityToken />
      {section.courseVersionName && (
        <input
          type="hidden"
          name="course"
          value={btoa(section.courseVersionName)}
        />
      )}
      {studentNames.map((name, index) => (
        <input key={index} type="hidden" name="names[]" value={name} />
      ))}
      <ActionDropdown
        name="section-options-dropdown"
        labelText="Section Options"
        menuPlacement="right"
        triggerButtonProps={{
          isIconOnly: true,
          icon: {
            iconName: 'ellipsis-vertical',
            iconStyle: 'solid',
          },
          color: 'gray',
          type: 'tertiary',
          size: 's',
          className: styles.dropdownButton,
          ariaLabel: i18n.sectionOptionsDropdown(),
        }}
        options={dropdownOptions}
      />
    </form>
  );
};
