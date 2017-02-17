
import React from 'react';
import classNames from 'classnames';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';

export const VISUALIZATION_DIV_ID = 'visualization';

/**
 * Protected div with ID "visualization" that depends on Redux state to render
 * with the "responsive" class or not.
 */
const ProtectedVisualizationDiv = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
  },

  render() {
    return (
      <ProtectedStatefulDiv
        id={VISUALIZATION_DIV_ID}
        className={classNames({responsive: true})}
      >
        {this.props.children}
      </ProtectedStatefulDiv>
    );
  }
});
export default ProtectedVisualizationDiv;
