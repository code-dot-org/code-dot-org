import React from 'react';
import FontAwesome from '../FontAwesome';
import color from "../../util/color";
import _ from 'lodash';

const styles = {
  section: {
    width: 1000,
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
    width: 1000
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
  content: {
    marginBottom: 50,
    marginLeft: 10
  }
};

const CollapsibleSection = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ]),
    header: React.PropTypes.string.isRequired,
    linkText: React.PropTypes.string.isRequired,
    link: React.PropTypes.string.isRequired,
  },

  getInitialState() {
    return {open: true};
  },

  toggleContent() {
    this.setState({open: !this.state.open});
  },

  renderContent() {
    const content = this.props.children;
    const childItems = _.isArray(this.props.children) ? this.props.children.slice(0, 2) : [this.props.children];

    if (this.state.open) {
      return (
        <div style={styles.content}>
          {childItems.map((content, index) =>
            <div key={index}>
              {content}
            </div>
          )}
        </div>
      );
    }
  },

  render() {
    const { header, link, linkText }= this.props;
    let icon = this.state.open ? 'caret-up' : 'caret-down';

    return (
      <div style={styles.section}>
        <div style={styles.heading}>
          <FontAwesome icon={icon} style={styles.arrowIcon} onClick={this.toggleContent}/>
          {header}
          <a href={link} style={styles.linkBox}>
            <div style={styles.linkToViewAll}>
              {linkText}
            </div>
            <FontAwesome icon="chevron-right" style={styles.chevron}/>
          </a>
        </div>
        {this.renderContent()}
      </div>
    );
  }
});

export default CollapsibleSection;
