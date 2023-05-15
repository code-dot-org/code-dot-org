import React from 'react';
import classNames from 'classnames';
import {useSelector} from 'react-redux';

const commonI18n = require('@cdo/locale');
const Spinner = require('@cdo/apps/code-studio/pd/components/spinner');
const moduleStyles = require('./save-status.module.scss').default;
const projectUpdatedStatuses =
  require('@cdo/apps/code-studio/projectRedux').projectUpdatedStatuses;

/**
 * Displays the project save status: a "Saving..." message with a spinner if saving,
 * an error message if there was a save error, or nothing if saving was sucessful.
 * Used on pages where the standard project header is not available.
 */
const SaveStatus: React.FunctionComponent<Record<string, never>> = () => {
  const updatedStatus = useSelector(
    (state: {project: {projectUpdatedStatus: string}}) =>
      state.project.projectUpdatedStatus
  );

  return (
    <div className={moduleStyles.saveMessageContainer}>
      <div
        className={classNames(
          moduleStyles.saveMessage,
          moduleStyles.saveMessageSaving,
          updatedStatus === projectUpdatedStatuses.saving &&
            moduleStyles.saveMessageShow
        )}
      >
        <Spinner size={'small'} />
        <div className={moduleStyles.saveMessageText}>
          {commonI18n.saving()}
        </div>
      </div>
      <div
        className={classNames(
          moduleStyles.saveMessage,
          moduleStyles.saveMessageError,
          updatedStatus === projectUpdatedStatuses.error &&
            moduleStyles.saveMessageShow
        )}
      >
        <div className={moduleStyles.saveMessageText}>
          {commonI18n.projectSaveError()}
        </div>
      </div>
    </div>
  );
};

export default SaveStatus;
