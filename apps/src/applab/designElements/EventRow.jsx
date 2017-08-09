import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import color from "../../util/color";
import * as rowStyle from './rowStyle';

var EventRow = createReactClass({
  propTypes: {
    name: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    handleInsert: PropTypes.func.isRequired
  },

  render: function () {
    var style = {
      container: Object.assign({}, rowStyle.container, rowStyle.maxWidth),
      name: {
        color: color.dark_charcoal,
        fontWeight: 'bold',
        fontSize: 15
      },
      desc: {
        color: color.light_gray,
        fontStyle: 'italic'
      }
    };

    return (
      <div style={style.container}>
        <div style={style.name}>
          {this.props.name}
        </div>
        <div style={style.desc}>
          {this.props.desc}
        </div>
        <div>
          <a onClick={this.props.handleInsert} className="hover-pointer">Insert and show code</a>
        </div>
      </div>
    );
  }
});
export default EventRow;
