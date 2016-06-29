/**
 * @overview Component for editing key/value pairs.
 */

import { DataView } from './constants';
import React from 'react';
import { changeView } from './redux/data';
import color from '../color';
import { connect } from 'react-redux';

const styles = {
  link: {
    color: color.purple,
    fontFamily: "'Gotham 7r', sans-serif"
  }
};

const DataProperties = React.createClass({
  propTypes: {
    // from redux state
    view: React.PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  render() {
    const visible = (DataView.PROPERTIES === this.props.view);
    return (
      <div id='dataProperties' style={{display: visible ? 'block' : 'none'}}>
         <h4>
           <a href='#' style={styles.link}
               onClick={() => this.props.onViewChange(DataView.OVERVIEW)}>
             Data
           </a>
           &nbsp;&gt; Key/value pairs
         </h4>
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(DataProperties);
