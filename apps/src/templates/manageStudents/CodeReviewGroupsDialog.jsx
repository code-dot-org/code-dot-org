import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import i18n from '@cdo/locale';

import CodeReviewGroupsStatusToggle from '../codeReviewGroups/CodeReviewGroupsStatusToggle';
import {addDroppableIdToGroups} from '../codeReviewGroups/CodeReviewGroupsUtils';

import moduleStyles from './codeReviewGroupsDialog.module.scss';

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

export default function CodeReviewGroupsDialog({dataApi}) {
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

  useEffect(() => getInitialGroups(), [getInitialGroups]);

  const renderBody = () => {
    switch (loadingStatus) {
      case LOADING_STATES.LOADING:
        return <Spinner className={moduleStyles.spinner} size="medium" />;
      case LOADING_STATES.LOADED:
        return (
          <CodeReviewGroupsManager groups={groups} setGroups={onGroupsUpdate} />
        );
      case LOADING_STATES.ERROR:
        return (
          <span className={moduleStyles.errorMessage}>
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
            className={moduleStyles.successMessage}
            id="uitest-code-review-groups-save-confirm"
          >
            <FontAwesomeV6Icon
              iconName="check"
              iconStyle="solid"
              className={moduleStyles.checkIcon}
            />
            {i18n.codeReviewGroupsSaveSuccess()}
          </span>
        );
      case SUBMIT_STATES.SUBMITTING:
        return <Spinner className={moduleStyles.spinner} size="medium" />;
      case SUBMIT_STATES.ERROR:
        return (
          <span className={moduleStyles.errorMessage}>
            {i18n.codeReviewGroupsSaveError()}
          </span>
        );
      default:
        return null;
    }
  };

  const submitNewGroups = () => {
    setSubmitStatus(SUBMIT_STATES.SUBMITTING);
    dataApi
      .setCodeReviewGroups(groups)
      .done(response => {
        setGroupsHaveChanged(false);
        setSubmitStatus(SUBMIT_STATES.SUCCESS);

        // Show alert if this caused any students to have sharing automatically enabled
        if (response.students_with_sharing_enabled?.length > 0) {
          const studentNames =
            response.students_with_sharing_enabled.join(', ');
          const message = `Project sharing (required for code reviews) has been enabled for the following students: ${studentNames}`;
          alert(message);
        }
      })
      .fail(() => {
        setSubmitStatus(SUBMIT_STATES.ERROR);
      });
  };

  return (
    <>
      <MuiButton
        id="uitest-code-review-groups-button"
        variant="outlined"
        color="tertiary"
        size="small"
        onClick={openDialog}
        type="button"
        startIcon={<FontAwesomeV6Icon iconName="comment" />}
      >
        {i18n.manageCodeReviewGroups()}
      </MuiButton>
      {isDialogOpen && (
        <Modal
          className={moduleStyles.dialog}
          title={i18n.codeReviewGroups()}
          onClose={onDialogClose}
          customContent={
            <div id="dsco-dialog-description">
              {renderBody()}
              <div className={moduleStyles.statusRow}>
                {renderSubmitStatus()}
              </div>
            </div>
          }
          customBottomContent={
            <div className={moduleStyles.toggleRow}>
              <CodeReviewGroupsStatusToggle />
            </div>
          }
          primaryButtonProps={{
            children: i18n.confirmChanges(),
            onClick: submitNewGroups,
            disabled: !groupsHaveChanged,
          }}
          secondaryButtonProps={{
            children: i18n.dialogCancel(),
            onClick: onDialogClose,
          }}
        />
      )}
    </>
  );
}

CodeReviewGroupsDialog.propTypes = {
  dataApi: PropTypes.object.isRequired,
};
