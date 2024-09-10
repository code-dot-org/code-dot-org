import React, {useState} from 'react';
import {ControlLabel, Fade, FormControl, FormGroup} from 'react-bootstrap';
import {connect} from 'react-redux';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {Heading4} from '@cdo/apps/componentLibrary/typography';
import {STATE_CODES} from '@cdo/apps/geographyConstants';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {bulkSet} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {BulkSetModalProps} from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/interface';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {selectedSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {RootState} from '@cdo/apps/types/redux';
import {CapLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import './style.scss';

const BulkSetModal: React.FC<BulkSetModalProps> = ({
  isOpen = false,
  onClose,
  // Provided by redux
  currentUser,
  section,
  bulkSet,
}) => {
  const [usState, setUsState] = useState(currentUser?.usStateCode || '');

  const handleUsStateChange: React.FormEventHandler<FormControl> = event => {
    setUsState((event.target as HTMLInputElement).value);
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
      },
      PLATFORMS.STATSIG
    );

    onClose();
  };

  return (
    <Fade in={isOpen} mountOnEnter unmountOnExit>
      <AccessibleDialog id="us-state-column-bulk-set-modal" onClose={onClose}>
        <Heading4 id="us-state-column-bulk-set-modal-title">
          {i18n.studentUsStateUpdatesModal_title()}
        </Heading4>

        <hr aria-hidden="true" />

        <FormGroup>
          <ControlLabel htmlFor="us-state">{i18n.usState()}</ControlLabel>
          <FormControl
            componentClass="select"
            id="us-state"
            name="usState"
            style={{width: 150}}
            value={usState}
            onChange={handleUsStateChange}
          >
            <option value="">{i18n.chooseUsState()}</option>
            {STATE_CODES.map(code => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <SafeMarkdown
          openExternalLinksInNewTab={true}
          markdown={i18n.studentUsStateUpdatesModal_desc({
            docURL: CapLinks.PARENTAL_CONSENT_GUIDE_URL,
          })}
        />

        <hr aria-hidden="true" />

        <div id="us-state-column-bulk-set-modal-footer">
          <Button
            text={i18n.cancel()}
            type="secondary"
            size="s"
            color={buttonColors.gray}
            onClick={onClose}
          />
          <Button
            text={i18n.add()}
            type="primary"
            size="s"
            onClick={bulkSetUsState}
          />
        </div>
      </AccessibleDialog>
    </Fade>
  );
};

export default connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
    section: selectedSection(state),
  }),
  dispatch => ({
    bulkSet(studentsData: {usState: string | null}) {
      dispatch(bulkSet(studentsData));
    },
  })
)(BulkSetModal);
