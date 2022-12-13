import React, {useContext, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {AnalyticsContext} from './context';
import moduleStyles from './topbuttons.module.scss';
import FontAwesome from '../templates/FontAwesome';
import AppConfig from './appConfig';

const TopButtons = ({clearCode, uploadSound}) => {
  const analyticsReporter = useContext(AnalyticsContext);
  const [shareMessageShowing, setShareMessageShowing] = useState(false);
  const inputRef = useRef(null);
  const showUploadSound = AppConfig.getValue('show-upload') === 'true';

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

  return (
    <div className={moduleStyles.buttonRow}>
      <button
        type="button"
        className={moduleStyles.button}
        onClick={startOverClicked}
      >
        <FontAwesome icon={'refresh'} />
        &nbsp; Start Over
      </button>
      <button
        type="button"
        className={moduleStyles.button}
        onClick={onShareClicked}
      >
        <FontAwesome icon={'share-square-o'} />
        &nbsp; Share
        <div
          className={classNames(
            moduleStyles.shareComingSoon,
            shareMessageShowing && moduleStyles.shareComingSoonShow
          )}
        >
          <FontAwesome icon={'clock-o'} />
          &nbsp; Sharing is under construction. Check back soon.
        </div>
      </button>
      <button
        type="button"
        className={moduleStyles.button}
        onClick={onFeedbackClicked}
      >
        <FontAwesome icon={'commenting'} />
        &nbsp; Feedback
      </button>
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
            Upload
          </button>
        </fieldset>
      )}
    </div>
  );
};

TopButtons.propTypes = {
  clearCode: PropTypes.func.isRequired,
  uploadSound: PropTypes.func.isRequired
};

export default TopButtons;
