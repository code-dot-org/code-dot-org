import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import CodeReviewGroupsLoader from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsLoader';
import CodeReviewGroupsStatusToggle from '../codeReviewGroups/CodeReviewGroupsStatusToggle';
import CodeReviewGroupsDataApi from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsDataApi';

const DIALOG_WIDTH = 1000;

export default function ManageCodeReviewGroups({
  buttonContainerStyle,
  sectionId
}) {
  const [groups, setGroups] = useState([]);
  const [groupsHaveChanged, setGroupsHaveChanged] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const onDialogClose = () => setIsDialogOpen(false);

  const setInitialGroups = groups => setGroups(groups);

  const setGroupsWrapper = groups => {
    setGroupsHaveChanged(true);
    setGroups(groups);
  };

  const renderFooter = buttons => {
    return (
      <>
        <CodeReviewGroupsStatusToggle />
        <div>{buttons}</div>
      </>
    );
  };

  const api = new CodeReviewGroupsDataApi(sectionId);
  const submitNewGroups = () => {
    api.setCodeReviewGroups(groups).success(() => {
      setGroupsHaveChanged(false);
    });
  };

  // TO DO:
  // [x] change button text on confirm/cancel
  // [x] add ability to disable confirmation button
  // [x] move group state management to top level
  // disable buttons until changes made
  // -- store initial state to disable again if no diffs?
  // -- is there some other disabling that should happen related to enable code review status?
  // check if group names are unique/non-null
  // -- add backend uniqueness check as well?
  // call data API on "Confirm Changes"
  // show some loading state while confirming changes
  // on success, show changes have been saved message. disable buttons until more change made. remove after some time?
  // on fail, show error has occurred message. remove after some time?

  // OTHER OPTIONS:
  // wrap dialog in loadablecomponent -- spinner next to button?
  // pull in loading logic here, so spinner is in body of modal
  // continue to use state in codereviewgroupsmanager, and have non-react groups variable in here
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
            setInitialGroups={setInitialGroups}
            setGroups={setGroupsWrapper}
          />
        }
        isOpen={isDialogOpen}
        handleClose={onDialogClose}
        handleConfirmation={submitNewGroups}
        fixedWidth={DIALOG_WIDTH}
        renderFooter={renderFooter}
        footerJustification="space-between"
        confirmationButtonText={i18n.confirmChanges()}
        disableConfirmationButton={!groupsHaveChanged}
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
