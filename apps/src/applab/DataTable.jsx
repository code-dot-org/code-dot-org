/**
 * @overview Component for editing a data table.
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

const DataTable = React.createClass({
  propTypes: {
    // from redux state
    tableName: React.PropTypes.string.isRequired,
    view: React.PropTypes.oneOf([DataView.OVERVIEW, DataView.PROPERTIES, DataView.TABLE]),

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  render() {
    const visible = (DataView.TABLE === this.props.view);
    return (
      <div id='dataTable' style={{display: visible ? 'block' : 'none'}}>
        <h4>
          <a href='#' style={styles.link}
             onClick={() => this.props.onViewChange(DataView.OVERVIEW)}>
            Data
          </a>
          &nbsp;&gt; {this.props.tableName}
        </h4>
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view,
  tableName: state.data.tableName || ''
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(DataTable);
