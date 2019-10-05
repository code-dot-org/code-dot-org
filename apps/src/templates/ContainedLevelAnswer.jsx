import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';

const styles = {
  hidden: {
    display: 'none'
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
    // dashboard provides us our contained level at #containedLevelAnswer0
    // Move it into this component once we mount.
    const container = $(ReactDOM.findDOMNode(this));
    $('#containedLevelAnswer0').appendTo(container);
  }

  render() {
    return (
      <div style={this.props.hidden ? styles.hidden : null}>
        <ProtectedStatefulDiv />
      </div>
    );
  }
}

export default ContainedLevelAnswer;
