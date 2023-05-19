import React, {useContext, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {AnalyticsContext} from '../context';
import moduleStyles from './topbuttons.module.scss';
import FontAwesome from '../../templates/FontAwesome';
import AppConfig from '../appConfig';
import musicI18n from '../locale';
import commonI18n from '@cdo/locale';
import {useSelector} from 'react-redux';
import Spinner from '../../code-studio/pd/components/spinner';
import {projectUpdatedStatuses} from '../../code-studio/projectRedux';

/**
 * Renders a set of miscellaneous buttons in the top of the Music Lab workspace,
 * including Start Over, Share, Feedback, and optionally Upload Sound.
 */
const TopButtons = ({clearCode, uploadSound, canShowSaveStatus}) => {
  const analyticsReporter = useContext(AnalyticsContext);
  const [shareMessageShowing, setShareMessageShowing] = useState(false);
  const inputRef = useRef(null);
  const showUploadSound = AppConfig.getValue('show-upload') === 'true';
  const updatedStatus = useSelector(
    state => state.project.projectUpdatedStatus
  );

  const startOverClicked = () => {
    analyticsReporter.onButtonClicked('start-over');
    clearCode();
  };

  const onFeedbackClicked = () => {
    analyticsReporter.onButtonClicked('feedback');
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLScnUgehPPNjhSNIcCpRMcHFgtE72TlfTOh6GkER6aJ-FtIwTQ/viewform?usp=sf_link',
      '_blank'
    );
  };

  const onShareClicked = () => {
    if (!shareMessageShowing) {
      analyticsReporter.onButtonClicked('share');
    }
    setShareMessageShowing(!shareMessageShowing);
  };

  const onUploadClicked = () => {
    if (inputRef.current.files[0] === undefined) {
      return false;
    }

    uploadSound(inputRef.current.files[0]);
  };

  const renderSaveMessage = () => {
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

  return (
    <div className={moduleStyles.buttonRow}>
      <button
        type="button"
        className={moduleStyles.button}
        onClick={startOverClicked}
      >
        <FontAwesome icon={'refresh'} />
        &nbsp; {musicI18n.startOver()}
      </button>
      <button
        type="button"
        className={moduleStyles.button}
        onClick={onShareClicked}
      >
        <FontAwesome icon={'share-square-o'} />
        &nbsp; {musicI18n.share()}
        <div
          className={classNames(
            moduleStyles.shareComingSoon,
            shareMessageShowing && moduleStyles.shareComingSoonShow
          )}
        >
          <FontAwesome icon={'clock-o'} />
          &nbsp; {musicI18n.shareComingSoon()}
        </div>
      </button>
      <button
        type="button"
        className={moduleStyles.button}
        onClick={onFeedbackClicked}
      >
        <FontAwesome icon={'commenting'} />
        &nbsp; {musicI18n.feedback()}
      </button>
      {canShowSaveStatus && renderSaveMessage()}
      {showUploadSound && (
        <fieldset>
          <input
            type="file"
            id="audio-file"
            ref={inputRef}
            accept="audio/mpeg, audio/ogg, audio/*"
            style={{width: 200}}
          />
          <button
            onClick={onUploadClicked}
            type="button"
            id="compress_btn"
            className={moduleStyles.button}
          >
            {musicI18n.upload()}
          </button>
        </fieldset>
      )}
    </div>
  );
};

TopButtons.propTypes = {
  clearCode: PropTypes.func.isRequired,
  uploadSound: PropTypes.func.isRequired,
  canShowSaveStatus: PropTypes.bool,
};

export default TopButtons;
