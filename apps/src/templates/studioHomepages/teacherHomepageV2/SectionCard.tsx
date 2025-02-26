import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {
  Heading5,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

interface SectionCardProps {
  section: Section;
}

export const SectionCard: React.FC<SectionCardProps> = ({section}) => {
  const onSectionSettingsClick = () => {
    // open section settings
  };

  const onRosterClick = () => {
    // open roster
  };

  const onLoginCardsClick = () => {
    // open login cards
  };

  const onCertificatesClick = () => {
    // open certificates
  };

  const onArchiveClick = () => {
    // archive section
  };

  const onDeleteClick = () => {
    // delete section
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
              icon: {iconName: 'ellipsis-vertical', iconStyle: 'solid'},
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
                value: 'archive',
                label: i18n.archive(),
                icon: {iconName: 'box-archive', iconStyle: 'solid'},
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
    </div>
  );
};
