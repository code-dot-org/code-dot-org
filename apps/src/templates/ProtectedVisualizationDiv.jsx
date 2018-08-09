import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';

export const VISUALIZATION_DIV_ID = 'visualization';

/**
 * @param {!Object} state - Redux state from any app.
 * @returns {boolean} TRUE if we expect to apply responsive styles to layout
 *          elements in the current view.
 */
export function isResponsiveFromState(state) {
  return state.pageConstants.isResponsive;
}

/**
 * Protected div with ID "visualization" that depends on Redux state to render
 * with the "responsive" class or not.
 */
class ProtectedVisualizationDiv extends React.Component {
  static propTypes = {
    isResponsive: PropTypes.bool.isRequired,
    children: PropTypes.node,
  };

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
}
export default connect(state => ({
  isResponsive: isResponsiveFromState(state)
}))(ProtectedVisualizationDiv);
