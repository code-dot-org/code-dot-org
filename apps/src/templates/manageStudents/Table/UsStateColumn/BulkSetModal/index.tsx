import React, {useState} from 'react';
import {ControlLabel, FormControl, FormGroup} from 'react-bootstrap';
import {connect, useSelector} from 'react-redux';

import {Heading4} from '@cdo/apps/componentLibrary/typography';
import {STATE_CODES} from '@cdo/apps/geographyConstants';
import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import {bulkSet} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {RootState} from '@cdo/apps/types/redux';
import {CapLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import './style.scss';
import {BulkSetModalProps} from './interface';

const BulkSetModal: React.FC<BulkSetModalProps> = ({
  isOpen = false,
  onClose,
  // Provided by redux
  bulkSet,
}) => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [usState, setUsState] = useState(currentUser?.usStateCode || '');

  const handleUsStateChange: React.FormEventHandler<FormControl> = event => {
    setUsState((event.target as HTMLInputElement).value);
  };

  const bulkSetStudents = () => {
    bulkSet({usState: usState || null});
    onClose();
  };

  return (
    <StylizedBaseDialog
      isOpen={isOpen}
      bodyId="us-state-column-bulk-set-modal"
      title={
        <Heading4 className="title">
          {i18n.studentUsStateUpdatesModal_title()}
        </Heading4>
      }
      confirmationButtonText={i18n.add()}
      handleConfirmation={bulkSetStudents}
      handleClose={onClose}
      fixedWidth={600}
    >
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
    </StylizedBaseDialog>
  );
};

export default connect(null, dispatch => ({
  bulkSet(studentsData: {usState: string | null}) {
    dispatch(bulkSet(studentsData));
  },
}))(BulkSetModal);
