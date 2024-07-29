import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Alert from '@cdo/apps/templates/alert';
import i18n from '@cdo/locale';

import {disabledBubblesSupportArticle} from './disabledBubbles';

/**
 * Component that displays a small notification at the top of the page when
 * postMilestone is disabled (and thus progress is disabled)
 */
export default class DisabledBubblesAlert extends React.Component {
  constructor(props) {
    super(props);

    // Once alert has been dismissed, don't show again.
    const disabledBubblesAlertSeen =
      sessionStorage.getItem('disabledBubblesAlertSeen') === 'true';
    this.state = {
      visible: !disabledBubblesAlertSeen,
    };
  }

  onClose = () => {
    this.setState({visible: false});
    sessionStorage.setItem('disabledBubblesAlertSeen', true);
  };

  render() {
    if (!this.state.visible) {
      return null;
    }

    return (
      <Alert onClose={this.onClose} type={'error'}>
        <div>
          <span style={styles.bold}>{i18n.disabledButtonsWarning() + ' '}</span>
          <span>{i18n.disabledButtonsInfo() + ' '}</span>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={disabledBubblesSupportArticle}
          >
            {i18n.learnMore()}
          </a>
        </div>
      </Alert>
    );
  }
}

const styles = {
  bold: {
    ...fontConstants['main-font-semi-bold'],
  },
};
