import React from 'react';

import applabMsg from '@cdo/applab/locale';

import color from '../../util/color';

import * as rowStyle from './rowStyle';

export default class EventHeaderRow extends React.Component {
  render() {
    const style = Object.assign({}, rowStyle.container, rowStyle.maxWidth, {
      color: color.charcoal,
    });

    return <div style={style}>{applabMsg.addEventHeader()}</div>;
  }
}
