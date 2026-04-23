import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Modal from '@code-dot-org/component-library/modal';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import {STATE_CODES} from '@cdo/apps/geographyConstants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {bulkSet} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {BulkSetModalProps} from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/interface';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {RootState} from '@cdo/apps/types/redux';
import {CapLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

const BulkSetModal: React.FC<BulkSetModalProps> = ({
  isOpen = false,
  onClose,
  // Provided by redux
  currentUser,
  section,
  bulkSet,
}) => {
  const [usState, setUsState] = useState(currentUser?.usStateCode || '');

  const handleUsStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUsState(event.target.value);
  };

  const bulkSetUsState = () => {
    const selectedUsState = usState || null;
    bulkSet({usState: selectedUsState});

    analyticsReporter.sendEvent(
      EVENTS.SECTION_STUDENTS_TABLE_US_STATE_BULK_SET,
      {
        sectionId: section.id,
        sectionLoginType: section.loginType,
        teacherUsState: currentUser?.usStateCode,
        selectedUsState,
      }
    );

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const items = [
    {value: '', text: i18n.chooseUsState()},
    ...STATE_CODES.map(code => ({value: code, text: code})),
  ];

  return (
    <Modal
      id="us-state-column-bulk-set-modal"
      title={i18n.studentUsStateUpdatesModal_title()}
      onClose={onClose}
      customContent={
        <>
          <SimpleDropdown
            name="usState"
            labelText={i18n.usState()}
            size="s"
            items={items}
            selectedValue={usState}
            onChange={handleUsStateChange}
          />
          <SafeMarkdown
            openExternalLinksInNewTab={true}
            markdown={i18n.studentUsStateUpdatesModal_desc({
              docURL: CapLinks.PARENTAL_CONSENT_GUIDE_URL,
            })}
          />
        </>
      }
      primaryButtonProps={{
        children: i18n.add(),
        onClick: bulkSetUsState,
      }}
      secondaryButtonProps={{
        children: i18n.cancel(),
        onClick: onClose,
      }}
    />
  );
};

export default connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
    section: selectedSectionSelector(state),
  }),
  dispatch => ({
    bulkSet(studentsData: {usState: string | null}) {
      dispatch(bulkSet(studentsData));
    },
  })
)(BulkSetModal);
