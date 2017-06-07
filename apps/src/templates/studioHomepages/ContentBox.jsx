import React from 'react';
import FontAwesome from '../FontAwesome';
import color from "../../util/color";

const styles = {
  box: {
    width: 940,
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
    clear: 'both',
    height: 30
  },
  spacer: {
    width: 20,
    float: 'left',
    color: color.white
  }
};

const ContentBox= React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ]),
    heading: React.PropTypes.string.isRequired,
    linkText: React.PropTypes.string,
    link: React.PropTypes.string,
    showLink: React.PropTypes.bool
  },

  render() {
    const { heading, link, linkText, showLink }= this.props;

    return (
      <div style={styles.box}>
        <div style={styles.heading}>
          {heading}
          {showLink &&
            <a href={link} style={styles.linkBox}>
              <div style={styles.linkToViewAll}>
                {linkText}
              </div>
            <FontAwesome icon="chevron-right" style={styles.chevron}/>
            </a>}
        </div>
        {React.Children.map(this.props.children, (child, index) => {
          return (
            <div key={index}>
              {child}
              {(index % 2 === 0) && <div style={styles.spacer}>.</div>}
            </div>
          );
        })}
        <div style={styles.clear}/>
      </div>
    );
  }
});

export default ContentBox;
