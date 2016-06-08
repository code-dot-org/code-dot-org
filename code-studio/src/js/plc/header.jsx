/*
  Header used by PLC, has navigation breadcrumb
 */

import React from 'react';
import color from '../color';

var PlcHeader = React.createClass({
  propTypes: {
    unit_name: React.PropTypes.string,
    course_view_path: React.PropTypes.string
  },

  render: function () {
    let breadcrumbContainerStyle = {
      marginBottom: '20'
    };

    let breadcrumbIconStyle = {
      margin: 5,
      color: color.charcoal
    };

    let currentPageStyle = {
      color: color.orange
    };

    return (
      <div style={breadcrumbContainerStyle}>
        <a href={this.props.course_view_path}>
          My Learning Plan
        </a>
        <span className='fa fa-caret-right' style={breadcrumbIconStyle}/>
        <span style={currentPageStyle}>
          {this.props.unit_name}
        </span>
      </div>
    );
  }
});

window.dashboard.plcHeader = PlcHeader;
