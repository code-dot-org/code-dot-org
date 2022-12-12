import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {AnalyticsContext} from './context';
import moduleStyles from './topbuttons.module.scss';
import FontAwesome from '../templates/FontAwesome';

const TopButtons = ({clearCode}) => {
  const analyticsReporter = useContext(AnalyticsContext);
  const [shareMessageShowing, setShareMessageShowing] = useState(false);

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
    </div>
  );
};

TopButtons.propTypes = {
  clearCode: PropTypes.func.isRequired
};

export default TopButtons;
