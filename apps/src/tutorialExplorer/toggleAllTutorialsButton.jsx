/* ToggleAllTutorialsButton: A button shown for non-en users which allows them
 * to show/hide the set of all tutorials and filters for all languages.
 */

import React from 'react';
import i18n from './locale';

const styles = {
  toggleAllTutorialsBlock: {
    width: "100%",
    clear: "both",
    textAlign: "center",
    paddingTop: 30,
    paddingBottom: 30
  }
};

const ToggleAllTutorialsButton = React.createClass({
  propTypes: {
    showAllTutorials: React.PropTypes.func.isRequired,
    hideAllTutorials: React.PropTypes.func.isRequired,
    showingAllTutorials: React.PropTypes.bool
  },

  render() {
    return (
      <div style={styles.toggleAllTutorialsBlock}>
        {!this.props.showingAllTutorials && (
          <button onClick={this.props.showAllTutorials}>
            {i18n.showAllTutorialsButton()}
            &nbsp;
            <i className="fa fa-caret-down" aria-hidden={true}/>
          </button>
        )}

        {this.props.showingAllTutorials && (
          <button onClick={this.props.hideAllTutorials}>
            {i18n.hideAllTutorialsButton()}
            &nbsp;
            <i className="fa fa-caret-up" aria-hidden={true}/>
          </button>
        )}
      </div>
    );
  }
});

export default ToggleAllTutorialsButton;
