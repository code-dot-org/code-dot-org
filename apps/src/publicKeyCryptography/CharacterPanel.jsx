/** @file Panel with title, used for each character in crypto widget */
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';

import color from '../util/color';

import {AnyChildren} from './types';

const style = {
  header: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 16,
    color: color.charcoal,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: color.charcoal,
    cursor: 'pointer',
  },
};

export default function CharacterPanel({title, children}) {
  return (
    <div className={`panel-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div style={style.header}>{title}</div>
      <div>{children}</div>
    </div>
  );
}
CharacterPanel.propTypes = {
  title: PropTypes.string,
  children: AnyChildren,
};
