/* ToggleAllTutorialsButton: A button shown for non-en users which allows them
 * to show/hide the set of all tutorials and filters for all languages.
 */

import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/tutorialExplorer/locale';

export default class ToggleAllTutorialsButton extends React.Component {
  static propTypes = {
    showAllTutorials: PropTypes.func.isRequired,
    hideAllTutorials: PropTypes.func.isRequired,
    showingAllTutorials: PropTypes.bool
  };

  render() {
    return (
      <div style={styles.toggleAllTutorialsBlock}>
        {!this.props.showingAllTutorials && (
          <button type="button" onClick={this.props.showAllTutorials}>
            {i18n.showAllTutorialsButton()}
            &nbsp;
            <i className="fa fa-caret-down" aria-hidden={true} />
          </button>
        )}

        {this.props.showingAllTutorials && (
          <button type="button" onClick={this.props.hideAllTutorials}>
            {i18n.hideAllTutorialsButton()}
            &nbsp;
            <i className="fa fa-caret-up" aria-hidden={true} />
          </button>
        )}
      </div>
    );
  }
}

const styles = {
  toggleAllTutorialsBlock: {
    width: '100%',
    clear: 'both',
    textAlign: 'center',
    paddingTop: 30,
    paddingBottom: 30
  }
};
