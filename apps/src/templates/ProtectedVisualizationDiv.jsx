
import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';

export const VISUALIZATION_DIV_ID = 'visualization';

/**
 * Protected div with ID "visualization" that depends on Redux state to render
 * with the "responsive" class or not.
 */
const ProtectedVisualizationDiv = React.createClass({
  propTypes: {
    isResponsive: React.PropTypes.bool.isRequired,
    children: React.PropTypes.node,
  },

  render() {
    return (
      <ProtectedStatefulDiv
        id={VISUALIZATION_DIV_ID}
        className={classNames({responsive: this.props.isResponsive})}
      >
        {this.props.children}
      </ProtectedStatefulDiv>
    );
  }
});
export default connect(state => ({
  isResponsive: true
}))(ProtectedVisualizationDiv);
