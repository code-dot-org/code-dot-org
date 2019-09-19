import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import color from '../util/color';
import i18n from '@cdo/locale';

const styles = {
  hidden: {
    display: 'none'
  },
  container: {
    margin: 20,
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: color.cyan,
    backgroundColor: color.lightest_cyan,
    borderRadius: 5
  },
  header: {
    color: color.white,
    backgroundColor: color.cyan,
    padding: 5,
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

class ContainedLevelAnswer extends Component {
  // Note: This component modifies portions of the DOM outside of itself upon
  // mounting. This is generally considered a bad practice, and should not be
  // copied elsewhere.

  static propTypes = {
    hidden: PropTypes.bool
  };

  componentDidMount() {
    // dashboard provides us our contained level at #containedLevel0
    // Move it into this component once we mount.
    const container = $(ReactDOM.findDOMNode(this));
    $('#containedLevelAnswer0').appendTo(container);
  }

  render() {
    return (
      <div style={this.props.hidden ? styles.hidden : styles.container}>
        <div style={styles.header}>{i18n.answer()}</div>
        <div>
          <ProtectedStatefulDiv />
        </div>
      </div>
    );
  }
}

export default ContainedLevelAnswer;
