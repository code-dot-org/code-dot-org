/*
  Header used by PLC, has navigation breadcrumb
 */

import React from 'react';
import color from "../../util/color";

var PlcHeader = React.createClass({
  propTypes: {
    unit_name: React.PropTypes.string,
    unit_view_path: React.PropTypes.string,
    course_view_path: React.PropTypes.string,
    page_name: React.PropTypes.string
  },

  render: function () {
    let breadcrumbStyle = {
      container: {
        marginBottom: 20
      },
      icon: {
        margin: 5,
        color: color.charcoal
      },
      currentPage: {
        color: color.orange
      }
    };

    return (
      <div style={breadcrumbStyle.container}>
        <a href={this.props.course_view_path}>
          My Learning Plan
        </a>
        <span className="fa fa-caret-right" style={breadcrumbStyle.icon}/>
        {
          this.props.page_name ? (
            <span>
              <a href={this.props.unit_view_path}>
                {this.props.unit_name}
              </a>
              <span className="fa fa-caret-right" style={breadcrumbStyle.icon}/>
              <span style={breadcrumbStyle.currentPage}>
                {this.props.page_name}
              </span>
            </span>
          ) : (
            <span style={breadcrumbStyle.currentPage}>
              {this.props.unit_name}
            </span>
          )
        }

      </div>
    );
  }
});

export default PlcHeader;
window.dashboard.plcHeader = PlcHeader;
