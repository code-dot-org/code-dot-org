import React from 'react';
import createReactClass from 'create-react-class';
import color from "../../util/color";
import * as rowStyle from './rowStyle';
import applabMsg from '@cdo/applab/locale';

var EventHeaderRow = createReactClass({
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
