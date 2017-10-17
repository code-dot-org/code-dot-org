/*
  Header used by PLC, has navigation breadcrumb
 */

import React, {PropTypes} from 'react';
import color from "../../util/color";

const breadcrumbStyle = {
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

export default class PlcHeader extends React.Component {
  static propTypes = {
    unit_name: PropTypes.string,
    unit_view_path: PropTypes.string,
    course_view_path: PropTypes.string,
    page_name: PropTypes.string
  };

  render() {
    return (
      <div style={breadcrumbStyle.container} className="uitest-plcbreadcrumb">
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
}
