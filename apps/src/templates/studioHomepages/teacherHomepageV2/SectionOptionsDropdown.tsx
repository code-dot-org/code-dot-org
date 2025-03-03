import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  toggleSectionHidden,
  importOrUpdateRoster,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {Student} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

export interface SectionOptionsDropdownProps {
  section: Section;
  onDeleteClickCallback: (sectionId: number) => void;
}

export const SectionOptionsDropdown: React.FC<SectionOptionsDropdownProps> = ({
  section,
  onDeleteClickCallback,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSectionSettingsClick = () => {
    navigate(
      `${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.settings}`
    );
  };

  const onRosterClick = () => {
    navigate(
      `${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.roster}`
    );
  };

  const onLoginCardsClick = () => {
    navigate(
      `${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.loginInfo}`
    );
  };

  const onCertificatesClick = () => {
    HttpClient.get(`/dashboardapi/sections/${section.id}/students`)
      .then(response => response.json())
      .then((json: Student[]) => {
        const students = json.map(student => student.name);
        const courseVersionName: string = section.courseVersionName || '';
        const urlParams = new URLSearchParams([
          ['course', btoa(courseVersionName)],
        ]);
        students.map(student => urlParams.append('names[]', student));
        window.location.href = `/certificates/batch?${urlParams.toString()}`;
      });
  };

  const onArchiveClick = () => {
    const hideShowEvent = section.hidden
      ? EVENTS.SECTION_TABLE_RESTORE_SECTION_CLICKED
      : EVENTS.SECTION_TABLE_ARCHIVE_SECTION_CLICKED;
    analyticsReporter.sendEvent(hideShowEvent, {}, PLATFORMS.BOTH);
    dispatch(toggleSectionHidden(section.id));
  };

  const onDeleteClick = () => {
    analyticsReporter.sendEvent(
      EVENTS.SECTION_TABLE_DELETE_SECTION_CLICKED,
      {},
      PLATFORMS.BOTH
    );
    onDeleteClickCallback(section.id);
  };

  const onSyncClick = () => {
    switch (section.loginType) {
      case OAuthSectionTypes.google_classroom:
        analyticsReporter.sendEvent(
          EVENTS.SECTION_TABLE_SYNC_GOOGLE_CLASSROOM_CLICKED,
          {},
          PLATFORMS.BOTH
        );
        break;
      case OAuthSectionTypes.clever:
        analyticsReporter.sendEvent(
          EVENTS.SECTION_TABLE_SYNC_CLEVER_CLICKED,
          {},
          PLATFORMS.BOTH
        );
        break;
    }
    // Section code is the course ID, without the G- or C- prefix.
    const courseId = section.code.replace(/^[GC]-/, '');
    dispatch(importOrUpdateRoster(courseId, section.name));
  };

  const dropdownOptions: ActionDropdownOption[] = [
    {
      value: 'sectionSettings',
      label: i18n.sectionSettings(),
      icon: {iconName: 'gear', iconStyle: 'solid'},
      onClick: onSectionSettingsClick,
    },
    {
      value: 'roster',
      label: i18n.roster(),
      icon: {iconName: 'user', iconStyle: 'solid'},
      onClick: onRosterClick,
    },

    {
      value: 'certificates',
      label: i18n.certificates(),
      icon: {iconName: 'file-certificate', iconStyle: 'solid'},
      onClick: onCertificatesClick,
    },
    {
      value: section.hidden ? 'restore' : 'archive',
      label: section.hidden ? i18n.restoreClassSection() : i18n.archive(),
      icon: {
        iconName: section.hidden ? 'window-restore' : 'box-archive',
        iconStyle: 'solid',
      },
      onClick: onArchiveClick,
    },
    {
      value: 'delete',
      label: i18n.delete(),
      icon: {iconName: 'trash', iconStyle: 'solid'},
      onClick: onDeleteClick,
    },
  ];

  const external_login_types: string[] = [
    'google_classroom',
    'clever',
    'lti_v1',
  ];

  if (section.loginType) {
    if (!external_login_types.includes(section.loginType)) {
      dropdownOptions.splice(2, 0, {
        value: 'loginCards',
        label: i18n.loginCards(),
        icon: {iconName: 'id-card', iconStyle: 'solid'},
        onClick: onLoginCardsClick,
      });
    } else if (section.loginType === 'google_classroom') {
      dropdownOptions.splice(0, 0, {
        value: 'google sync',
        label: i18n.syncGoogle(),
        icon: {iconName: 'rotate', iconStyle: 'solid'},
        onClick: onSyncClick,
      });
    } else if (section.loginType === 'clever') {
      dropdownOptions.splice(0, 0, {
        value: 'clever sync',
        label: i18n.syncCleverDropdown(),
        icon: {iconName: 'rotate', iconStyle: 'solid'},
        onClick: onSyncClick,
      });
    }
  }

  return (
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
  );
};
