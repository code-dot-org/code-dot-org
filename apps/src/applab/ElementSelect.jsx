import React, {PropTypes} from 'react';
import * as elementUtils from './designElements/elementUtils.js';

export default React.createClass({
  propTypes: {
    onChangeElement: PropTypes.func.isRequired,
    elementIdList: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.instanceOf(HTMLElement)
  },

  handleChange: function (e) {
    var element = elementUtils.getPrefixedElementById(e.target.value);
    this.props.onChangeElement(element, null);
  },

  render: function () {
    var selected = elementUtils.getId(this.props.selected);

    return (
      <div style={{float: 'right', marginRight: '-10px'}}>
        <select value={selected} onChange={this.handleChange} style={{width: '150px'}}>
          {this.props.elementIdList.map(function (id) {
            return <option key={id}>{id}</option>;
          })}
        </select>
      </div>
    );
  }
});
