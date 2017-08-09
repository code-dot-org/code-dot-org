import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styleConstants from '../../styleConstants';

const style = {
  width: styleConstants['content-width'],
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
};

/** Uses flexbox to arrange content cards into nice rows with wrapping. */
export default class CardContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
  };

  render() {
    return (
      <div style={style}>
        {this.props.children}
      </div>
    );
  }
}
