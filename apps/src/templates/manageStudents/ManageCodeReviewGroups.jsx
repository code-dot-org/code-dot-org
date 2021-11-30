import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import CodeReviewGroupsStatusToggle from '../codeReviewGroups/CodeReviewGroupsStatusToggle';
import CodeReviewGroupsDataApi from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsDataApi';
import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';

const DIALOG_WIDTH = 1000;
const STATUS_MESSAGE_TIME_MS = 5000;

const SUBMIT_STATES = {
  DEFAULT: 'default',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function ManageCodeReviewGroups({
  buttonContainerStyle,
  sectionId
}) {
  const [groups, setGroups] = useState([]);
  const [groupsHaveChanged, setGroupsHaveChanged] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(SUBMIT_STATES.DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const onDialogClose = () => setIsDialogOpen(false);

  const setInitialGroups = groups => setGroups(groups);
  const setGroupsWrapper = groups => {
    setGroupsHaveChanged(true);
    setGroups(groups);
  };

  useEffect(() => getInitialGroups(), []);

  const resetStatusAfterWait = () => {
    setTimeout(
      () => setSubmitStatus(SUBMIT_STATES.DEFAULT),
      STATUS_MESSAGE_TIME_MS
    );
  };

  const renderStatusMessage = () => {
    switch (submitStatus) {
      case SUBMIT_STATES.SUCCESS:
        return (
          <span style={styles.successMessageContainer}>
            <i className={'fa fa-check fa-lg'} style={styles.checkIcon} />
            {i18n.codeReviewGroupsSaveSuccess()}
          </span>
        );
      case SUBMIT_STATES.SUBMITTING:
        return <Spinner style={styles.spinner} size="medium" />;
      case SUBMIT_STATES.ERROR:
        return (
          <span style={styles.errorMessageContainer}>
            {i18n.codeReviewGroupsSaveError()}
          </span>
        );
    }
  };

  const renderFooter = buttons => {
    return (
      <>
        <CodeReviewGroupsStatusToggle />
        <div>
          {renderStatusMessage()}
          {buttons}
        </div>
      </>
    );
  };

  const api = new CodeReviewGroupsDataApi(sectionId);
  const getInitialGroups = () => {
    api
      .getCodeReviewGroups()
      .then(groups => {
        setInitialGroups(groups);
        setIsLoading(false);
      })
      .fail(error => console.log(error));
  };
  const submitNewGroups = () => {
    setSubmitStatus(SUBMIT_STATES.SUBMITTING);
    api
      .setCodeReviewGroups(groups)
      .success(() => {
        setGroupsHaveChanged(false);
        setSubmitStatus(SUBMIT_STATES.SUCCESS);
        resetStatusAfterWait();
      })
      .fail(() => {
        setSubmitStatus(SUBMIT_STATES.ERROR);
        resetStatusAfterWait();
      });
  };

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
          isLoading ? (
            <Spinner style={styles.spinner} size="medium" />
          ) : (
            <CodeReviewGroupsManager
              groups={groups}
              setGroups={setGroupsWrapper}
            />
          )
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
  },
  checkIcon: {
    padding: 5
  },
  successMessageContainer: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.level_perfect
  },
  errorMessageContainer: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red
  }
};
