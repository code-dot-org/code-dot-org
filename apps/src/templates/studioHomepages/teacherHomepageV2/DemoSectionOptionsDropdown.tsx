import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useMemo} from 'react';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {Student} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import {CERTIFICATE_URL} from './SectionOptionsDropdown';

import styles from './teacherHomepage.module.scss';

const CERTIFICATES_ACTION_KEY = 'certificates';

interface DemoSectionOptionsDropdownProps {
  section: Section;
  disabled?: boolean;
  handleNavigationClick: (
    path: string,
    eventName: string
  ) => Promise<void> | void;
  createSectionForAction: (
    eventName: string,
    pendingKey: string
  ) => Promise<Section | void>;
}

const DemoSectionOptionsDropdown: React.FC<DemoSectionOptionsDropdownProps> = ({
  section,
  disabled = false,
  handleNavigationClick,
  createSectionForAction,
}) => {
  const certFormRef = React.useRef<HTMLFormElement>(null);

  const [studentNames, setStudentNames] = React.useState<string[]>([]);
  const [certificateCourse, setCertificateCourse] = React.useState<
    string | undefined
  >(section.courseVersionName);

  const onClickPrintCerts = React.useCallback(
    async (targetSection: Section) => {
      const result = await HttpClient.fetchJson<Student[]>(
        `/dashboardapi/sections/${targetSection.id}/students`
      ).catch(error => {
        console.error('Error retrieving student names for certificates', error);
        return null;
      });

      if (!result) {
        return;
      }

      const names = result.value.map((student: {name: string}) => student.name);
      setStudentNames(names);
      setCertificateCourse(targetSection.courseVersionName);
      certFormRef.current?.submit();
    },
    []
  );

  const handleCertificatesClick = React.useCallback(async () => {
    if (disabled) {
      return;
    }

    try {
      const section = await createSectionForAction(
        EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
        CERTIFICATES_ACTION_KEY
      );
      if (!section) {
        return;
      }
      await onClickPrintCerts(section);
    } catch {
      // DemoSectionCard owns the notice banner for create failures.
    }
  }, [createSectionForAction, disabled, onClickPrintCerts]);

  const dropdownOptions = useMemo(
    () => [
      <li key={'sectionSettings'}>
        <button
          type="button"
          className={styles.dropdownMenuItem}
          disabled={disabled}
          onClick={() =>
            handleNavigationClick(
              TEACHER_NAVIGATION_PATHS.settings,
              EVENTS.SECTION_CARD_SETTINGS_CLICKED
            )
          }
        >
          <FontAwesomeV6Icon iconName="gear" iconStyle="solid" />
          <span>{i18n.sectionSettings()}</span>
        </button>
      </li>,
      <li key={'roster'}>
        <button
          type="button"
          className={styles.dropdownMenuItem}
          disabled={disabled}
          onClick={() =>
            handleNavigationClick(
              TEACHER_NAVIGATION_PATHS.roster,
              EVENTS.SECTION_CARD_ROSTER_CLICKED
            )
          }
        >
          <FontAwesomeV6Icon iconName="user" iconStyle="solid" />
          <span>{i18n.roster()}</span>
        </button>
      </li>,
      <li key={'loginCards'}>
        <button
          type="button"
          className={styles.dropdownMenuItem}
          disabled={disabled}
          onClick={() =>
            handleNavigationClick(
              TEACHER_NAVIGATION_PATHS.loginInfo,
              EVENTS.SECTION_CARD_LOGIN_CARDS_CLICKED
            )
          }
        >
          <FontAwesomeV6Icon iconName="id-card" iconStyle="solid" />
          <span>{i18n.loginCards()}</span>
        </button>
      </li>,
      <li key={'certificates'}>
        <button
          id="ui-test-print-certificates"
          type="button"
          className={styles.dropdownMenuItem}
          disabled={disabled}
          onClick={handleCertificatesClick}
        >
          <FontAwesomeV6Icon iconName="file-certificate" iconStyle="solid" />
          <Typography variant="body2" component="span">
            {i18n.certificates()}
          </Typography>
        </button>
      </li>,
    ],
    [disabled, handleCertificatesClick, handleNavigationClick]
  );

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
        name="demo-section-options-dropdown"
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
          disabled: disabled,
        }}
      >
        <ul>{dropdownOptions}</ul>
      </CustomDropdown>
    </form>
  );
};

export default DemoSectionOptionsDropdown;
