import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import CodeReviewGroupsLoader from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsLoader';
import CodeReviewGroupsStatusToggle from '../codeReviewGroups/CodeReviewGroupsStatusToggle';

const DIALOG_WIDTH = 1000;

export default function ManageCodeReviewGroups({
  buttonContainerStyle,
  sectionId
}) {
  const [groups, setGroups] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const onDialogClose = () => setIsDialogOpen(false);

  const renderFooter = buttons => {
    return (
      <>
        <CodeReviewGroupsStatusToggle />
        <div>{buttons}</div>
      </>
    );
  };

  const submitNewGroups = groups => {
    console.log('submitted');
  };

  // [x] change button text on confirm/cancel
  // [x] add ability to disable confirmation button
  // disable buttons until changes made
  // -- store initial state to disable again if no diffs?
  // -- some other disabling that should happen related to enable code review status?
  // check if group names are unique
  // -- add backend uniqueness check as well?
  // call data API on "Confirm Changes"
  // show some loading state while confirming changes
  // on success, show changes have been saved message. disable buttons until more change madde. remove after some time?
  // on fail, show error has occurred message. remove after some time?

  return (
    <div style={{...styles.buttonContainer, ...buttonContainerStyle}}>
      {/* use div instead of button HTML element via __useDeprecatedTag
          for consistent spacing with other "buttons" in ManageStudentsTable header */}
      <Button
        __useDeprecatedTag
        onClick={openDialog}
        color={Button.ButtonColor.gray}
        text={i18n.manageCodeReviewGroups()}
        icon="comment"
      />
      <StylizedBaseDialog
        title={i18n.codeReviewGroups()}
        body={
          <CodeReviewGroupsLoader
            sectionId={sectionId}
            groups={groups}
            setGroups={setGroups}
          />
        }
        isOpen={isDialogOpen}
        handleClose={onDialogClose}
        handleConfirmation={submitNewGroups}
        fixedWidth={DIALOG_WIDTH}
        renderFooter={renderFooter}
        footerJustification="space-between"
        confirmationButtonText={i18n.confirmChanges()}
        disableConfirmationButton={false}
      />
    </div>
  );
}

ManageCodeReviewGroups.propTypes = {
  sectionId: PropTypes.number.isRequired,
  buttonContainerStyle: PropTypes.object
};

const styles = {
  buttonContainer: {
    marginLeft: 5
  }
};
