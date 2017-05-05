import React from 'react';
import FontAwesome from '../FontAwesome';
import color from "../../util/color";

const styles = {
  section: {
    width: 940,
    marginBottom: 50,
  },
  heading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    fontFamily: 'Gotham 3r',
    zIndex: 2,
    color: color.charcoal,
    width: 940
  },
  arrowIcon: {
    paddingRight: 8
  },
  linkToViewAll: {
    color: color.teal,
    fontSize: 14,
    fontFamily: 'Gotham 4r',
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
  clear: {
    clear: 'both'
  },
  spacer: {
    width: 20,
    float: 'left',
    color: color.white
  }
};

const CollapsibleSection = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ]),
    header: React.PropTypes.string.isRequired,
    linkText: React.PropTypes.string,
    link: React.PropTypes.string,
  },

  getInitialState() {
    return {open: true};
  },

  toggleContent() {
    this.setState({open: !this.state.open});
  },

  renderContent() {
    if (this.state.open) {
      return (
        <div>
          {React.Children.map(this.props.children, (child, index) => {
            return (
              <div key={index}>
                {child}
                {(index % 2 === 0) && <div style={styles.spacer}>.</div>}
              </div>
            );
          })}
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
          {link &&
            <a href={link} style={styles.linkBox}>
              <div style={styles.linkToViewAll}>
                {linkText}
              </div>
            <FontAwesome icon="chevron-right" style={styles.chevron}/>
            </a>}
        </div>
        {this.renderContent()}
        <div style={styles.clear}/>
      </div>
    );
  }
});

export default CollapsibleSection;
