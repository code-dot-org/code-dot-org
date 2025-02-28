import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {
  Heading5,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {
  removeSectionOrThrow,
  toggleSectionHidden,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {Student} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {SectionDeleteDialog} from './SectionDeleteDialog';

import styles from './teacherHomepage.module.scss';

interface SectionCardProps {
  section: Section;
}

export const SectionCard: React.FC<SectionCardProps> = ({section}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [deletingSection, setDeletingSection] = useState<boolean>(false);

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
    dispatch(toggleSectionHidden(section.id));
  };

  const onDeleteClick = () => {
    setDeletingSection(true);
  };

  const onCloseDeleteDialog = () => {
    setDeletingSection(false);
  };

  const deleteSection = () => {
    $.ajax({
      url: `/dashboardapi/sections/${section.id}`,
      method: 'DELETE',
    })
      .done(() => {
        dispatch(removeSectionOrThrow(section.id));
      })
      .fail((jqXhr, status) => {
        // We may want to handle this more cleanly in the future, but for now this
        // matches the experience we got in angular
        alert(i18n.unexpectedError());
        console.error(status);
      });
  };

  return (
    <div className={styles.sectionCardWrapper}>
      <div className={styles.sectionCardHeader}>
        <div className={styles.sectionCardHeaderLeft}>
          <div className={styles.sectionCardHeaderText}>
            <Heading5>{section.name}</Heading5>
          </div>
          <div className={styles.sectionCardCode}>
            <OverlineOneText>
              {i18n.classCode()}
              <a href={teacherDashboardUrl(section.id, '/login_info')}>
                {section.code}
              </a>
            </OverlineOneText>
          </div>
        </div>
        <div className={styles.sectionCardHeaderRight}>
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
            options={[
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
                value: 'loginCards',
                label: i18n.loginCards(),
                icon: {iconName: 'id-card', iconStyle: 'solid'},
                onClick: onLoginCardsClick,
              },
              {
                value: 'certificates',
                label: i18n.certificates(),
                icon: {iconName: 'file-certificate', iconStyle: 'solid'},
                onClick: onCertificatesClick,
              },
              {
                value: section.hidden ? 'restore' : 'archive',
                label: section.hidden
                  ? i18n.restoreClassSection()
                  : i18n.archive(),
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
            ]}
          />
        </div>
      </div>
      {deletingSection && (
        <SectionDeleteDialog
          onCloseCallback={onCloseDeleteDialog}
          sectionDeleteCallback={deleteSection}
        />
      )}
    </div>
  );
};
