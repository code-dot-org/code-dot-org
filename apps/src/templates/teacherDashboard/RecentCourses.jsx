import React from 'react';
import FontAwesome from '../FontAwesome';
import i18n from "@cdo/locale";
import color from "../../util/color";

const styles = {
  section: {
    width: 1600,
  },
  heading: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    marginLeft: 15,
    fontSize: 24,
    fontFamily: '"Gotham 3r", sans-serif',
    zIndex: 2,
    color: color.charcoal,
    width: 1075
  },
  arrowIcon: {
    paddingRight: 8
  },
  linkToViewAll: {
    color: color.teal,
    fontSize: 12,
    fontFamily: '"Gotham", sans-serif',
    fontWeight: 'bold',
    marginTop: -2,
    display: 'inline'
  },
  chevron: {
    display: 'inline',
    color: color.teal,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  linkBox: {
    display: 'inline',
    float: 'right',
    textDecoration: 'none'
  },
};

const RecentCourses = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ])
  },

  getInitialState() {
    return {open: true};
  },

  renderArrowIcon() {
    let icon = this.state.open ? 'caret-up' : 'caret-down';
    return (
     <FontAwesome icon={icon} style={styles.arrowIcon} onClick={this.toggleContent}/>
    );
  },

  toggleContent() {
    this.setState({open: !this.state.open});
  },

  renderContent() {
    const content = this.props.children;

    if (this.state.open) {
      if (content.length > 1) {
        return (
          <div style={styles.content}>
             {content.slice(0,2).map((course, index) =>
               <div style={styles.card} key={index}>
                 {course}
               </div>
             )}
          </div>
        );
      }
      return (
        <div style={styles.content}>
          {content}
        </div>
      );
    }
  },

  render() {
    return (
      <div style={styles.section}>
        <div style={styles.heading}>
          {this.renderArrowIcon()}
          {i18n.recentCourses()}
          <a href={"to view all the courses"} style={styles.linkBox}>
            <div style={styles.linkToViewAll}>
              {i18n.viewAllCourses()}
            </div>
            <FontAwesome icon="chevron-right" style={styles.chevron}/>
          </a>
        </div>
        {this.renderContent()}
      </div>
    );
  }
});

export default RecentCourses;
