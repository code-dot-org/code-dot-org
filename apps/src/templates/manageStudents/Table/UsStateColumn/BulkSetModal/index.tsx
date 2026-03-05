import {Typography, Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';
import {ControlLabel, Fade, FormControl, FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';

import {STATE_CODES} from '@cdo/apps/geographyConstants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {bulkSet} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {BulkSetModalProps} from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/interface';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
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
      }
    );

    onClose();
  };

  return (
    <Fade in={isOpen} mountOnEnter unmountOnExit>
      <AccessibleDialog id="us-state-column-bulk-set-modal" onClose={onClose}>
        <Typography
          id="us-state-column-bulk-set-modal-title"
          variant="h4"
          gutterBottom
        >
          {i18n.studentUsStateUpdatesModal_title()}
        </Typography>

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
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="small"
            onClick={onClose}
            type="button"
          >
            {i18n.cancel()}
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={bulkSetUsState}
            type="button"
          >
            {i18n.add()}
          </MuiButton>
        </div>
      </AccessibleDialog>
    </Fade>
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
