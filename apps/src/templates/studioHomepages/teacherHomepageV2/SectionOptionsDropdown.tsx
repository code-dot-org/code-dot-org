import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useMemo} from 'react';

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

import LinkOption from './LinkOption';

import styles from './teacherHomepage.module.scss';

export interface SectionOptionsDropdownProps {
  section: Section;
  onDeleteClickCallback: (sectionId: number) => void;
}

const CERTIFICATE_URL = '/certificates/batch';

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

const SectionOptionsDropdown: React.FC<SectionOptionsDropdownProps> = ({
  section,
  onDeleteClickCallback,
}) => {
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

  const dropdownOptions = useMemo(() => {
    const options = [
      <LinkOption
        key={'sectionSettings'}
        value={TEACHER_NAVIGATION_PATHS.settings}
        label={i18n.sectionSettings()}
        iconName={'gear'}
        url={`../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.settings}`}
        eventName={EVENTS.SECTION_CARD_SETTINGS_CLICKED}
        eventOptions={{}}
      />,
      <LinkOption
        key={'roster'}
        value={TEACHER_NAVIGATION_PATHS.roster}
        label={i18n.roster()}
        iconName={'user'}
        url={`../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.roster}`}
        eventName={EVENTS.SECTION_CARD_ROSTER_CLICKED}
        eventOptions={{}}
      />,
      <LinkOption
        key={'loginCards'}
        value={TEACHER_NAVIGATION_PATHS.loginInfo}
        label={i18n.loginCards()}
        iconName={'id-card'}
        url={`../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.loginInfo}`}
        eventName={EVENTS.SECTION_CARD_LOGIN_CARDS_CLICKED}
        eventOptions={{}}
      />,
      <li key={'certificates'}>
        <button
          id="ui-test-print-certificates"
          type="button"
          className={styles.dropdownMenuItem}
          onClick={onClickPrintCerts}
        >
          <FontAwesomeV6Icon iconName="file-certificate" iconStyle="solid" />
          <span>{i18n.certificates()}</span>
        </button>
      </li>,
      <li key={'archive'}>
        <button
          id="ui-test-archive-section"
          type="button"
          className={styles.dropdownMenuItem}
          onClick={() => onArchiveClick(dispatch, section)}
        >
          <FontAwesomeV6Icon
            iconName={section.hidden ? 'window-restore' : 'box-archive'}
            iconStyle="solid"
          />
          <span>
            {section.hidden ? i18n.restoreClassSection() : i18n.archive()}
          </span>
        </button>
      </li>,
    ];

    if (section.studentCount === 0) {
      options.push(
        <li key={'delete'}>
          <button
            id="ui-test-delete-section"
            type="button"
            className={styles.dropdownMenuItem}
            onClick={() => onDeleteClick(onDeleteClickCallback, section.id)}
          >
            <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
            <span>{i18n.delete()}</span>
          </button>
        </li>
      );
    }
    return options;
  }, [section, dispatch, onDeleteClickCallback, onClickPrintCerts]);

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
      <CustomDropdown
        name="section-options-dropdown"
        labelText="Section Options"
        menuPlacement="right"
        size="m"
        useDSCOButtonAsTrigger={true}
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
      >
        <ul>{dropdownOptions}</ul>
      </CustomDropdown>
    </form>
  );
};

export default SectionOptionsDropdown;
