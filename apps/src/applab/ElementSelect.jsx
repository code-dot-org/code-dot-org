import PropTypes from 'prop-types';
import React from 'react';

import * as elementUtils from './designElements/elementUtils.js';

export default class ElementSelect extends React.Component {
  static propTypes = {
    onChangeElement: PropTypes.func.isRequired,
    elementIdList: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.instanceOf(HTMLElement),
  };

  handleChange = e => {
    const element = elementUtils.getPrefixedElementById(e.target.value);
    this.props.onChangeElement(element, null);
  };

  render() {
    const selected = elementUtils.getId(this.props.selected);

    return (
      <div style={{float: 'right', marginRight: '-10px'}}>
        <select
          className="form-control"
          value={selected}
          onChange={this.handleChange}
          style={{width: '150px'}}
          data-notranslate="true"
        >
          {this.props.elementIdList.map(function (id) {
            return <option key={id}>{id}</option>;
          })}
        </select>
      </div>
    );
  }
}
