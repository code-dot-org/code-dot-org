/** @file Panel with title, used for each character in crypto widget */
import React, {PropTypes} from 'react';
import color from "../util/color";
import {AnyChildren} from './types';

const style = {
  header: {
    fontFamily: `"Gotham 5r", sans-serif`,
    fontSize: 16,
    color: color.charcoal,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: color.charcoal,
    cursor: 'pointer'
  }
};

export default function CharacterPanel({title, children}) {
  return (
    <div className={`panel-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div style={style.header}>
        {title}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
CharacterPanel.propTypes = {
  title: PropTypes.string,
  children: AnyChildren
};
