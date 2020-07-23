import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';

export default class Tooltip extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    place: PropTypes.oneOf(['top', 'right', 'bottom', 'left'])
  };

  state = {
    id: _.uniqueId()
  };

  render() {
    const {children, text, place} = this.props;
    const {id} = this.state;

    return (
      <span data-for={this.state.id} data-tip data-place={place}>
        {children}
        <ReactTooltip id={id} role="tooltip" effect="solid">
          <div>{text}</div>
        </ReactTooltip>
      </span>
    );
  }
}
