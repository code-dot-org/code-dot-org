import React from 'react';
import color from '../../color';
import * as rowStyle from './rowStyle';
import applabMsg from '@cdo/applab/locale';

var EventHeaderRow = React.createClass({
  render: function () {
    var style = Object.assign({}, rowStyle.container, rowStyle.maxWidth, {
      color: color.charcoal
    });

    return (
      <div style={style}>
        {applabMsg.addEventHeader()}
      </div>
    );
  }
});

export default EventHeaderRow;
