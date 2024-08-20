import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import CodeReviewGroupsStatusToggle from '../codeReviewGroups/CodeReviewGroupsStatusToggle';
import {addDroppableIdToGroups} from '../codeReviewGroups/CodeReviewGroupsUtils';

// Width taken from UI mocks (meant to fit in a minimum screen width of 1024px with some extra space)
const DIALOG_WIDTH = 934;

const SUBMIT_STATES = {
  DEFAULT: 'default',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
};

const LOADING_STATES = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
};

export default function CodeReviewGroupsDialog({
  buttonContainerStyle,
  dataApi,
}) {
  const [groups, setGroups] = useState([]);
  const [groupsHaveChanged, setGroupsHaveChanged] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(SUBMIT_STATES.DEFAULT);
  const [loadingStatus, setLoadingStatus] = useState(LOADING_STATES.LOADING);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const onDialogClose = () => setIsDialogOpen(false);

  const onGroupsUpdate = groups => {
    if (submitStatus === SUBMIT_STATES.SUCCESS) {
      setSubmitStatus(SUBMIT_STATES.DEFAULT);
    }

    setGroupsHaveChanged(true);
    setGroups(groups);
  };

  useEffect(() => getInitialGroups(), [getInitialGroups]);

  const renderModalBody = () => {
    switch (loadingStatus) {
      case LOADING_STATES.LOADING:
        return <Spinner style={styles.spinner} size="medium" />;
      case LOADING_STATES.LOADED:
        return (
          <CodeReviewGroupsManager groups={groups} setGroups={onGroupsUpdate} />
        );
      case LOADING_STATES.ERROR:
        return (
          <span style={styles.errorMessageContainer}>
            {i18n.codeReviewGroupsLoadError()}
          </span>
        );
      default:
        return null;
    }
  };

  const renderSubmitStatus = () => {
    switch (submitStatus) {
      case SUBMIT_STATES.SUCCESS:
        return (
          <span
            style={styles.successMessageContainer}
            id="uitest-code-review-groups-save-confirm"
          >
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
      default:
        return null;
    }
  };

  const renderFooter = buttons => {
    return (
      <>
        <CodeReviewGroupsStatusToggle />
        <div>
          {renderSubmitStatus()}
          {buttons}
        </div>
      </>
    );
  };

  const getInitialGroups = useCallback(() => {
    setLoadingStatus(LOADING_STATES.LOADING);
    setSubmitStatus(SUBMIT_STATES.DEFAULT);
    setGroupsHaveChanged(false);
    dataApi
      .getCodeReviewGroups()
      .done(groups => {
        setGroups(addDroppableIdToGroups(groups));
        setLoadingStatus(LOADING_STATES.LOADED);
      })
      .fail(() => setLoadingStatus(LOADING_STATES.ERROR));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitNewGroups = () => {
    setSubmitStatus(SUBMIT_STATES.SUBMITTING);
    dataApi
      .setCodeReviewGroups(groups)
      .done(() => {
        setGroupsHaveChanged(false);
        setSubmitStatus(SUBMIT_STATES.SUCCESS);
      })
      .fail(() => {
        setSubmitStatus(SUBMIT_STATES.ERROR);
      });
  };

  return (
    <div style={{...styles.buttonContainer, ...buttonContainerStyle}}>
      <Button
        id="uitest-code-review-groups-button"
        style={styles.button}
        onClick={openDialog}
        color={Button.ButtonColor.gray}
        text={i18n.manageCodeReviewGroups()}
        icon="comment"
      />
      <StylizedBaseDialog
        title={i18n.codeReviewGroups()}
        isOpen={isDialogOpen}
        handleClose={onDialogClose}
        handleConfirmation={submitNewGroups}
        fixedWidth={DIALOG_WIDTH}
        renderFooter={renderFooter}
        footerJustification="space-between"
        confirmationButtonText={i18n.confirmChanges()}
        disableConfirmationButton={!groupsHaveChanged}
        stickyHeaderFooter={true}
      >
        {renderModalBody()}
      </StylizedBaseDialog>
    </div>
  );
}

CodeReviewGroupsDialog.propTypes = {
  dataApi: PropTypes.object.isRequired,
  buttonContainerStyle: PropTypes.object,
};

const styles = {
  buttonContainer: {
    marginLeft: 5,
  },
  checkIcon: {
    padding: 5,
  },
  successMessageContainer: {
    ...fontConstants['main-font-semi-bold'],
    color: color.level_perfect,
  },
  errorMessageContainer: {
    ...fontConstants['main-font-semi-bold'],
    color: color.red,
  },
  button: {
    boxShadow: 'inset 0 2px 0 0 rgba(255, 255, 255, 0.8)',
    marginTop: 0,
  },
};
