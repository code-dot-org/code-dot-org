import React, {Component, PropTypes} from 'react';
import FontAwesome from './FontAwesome';
import color from "../util/color";
import styleConstants from '../styleConstants';

// ContentContainer provides a full-width container which will render whatever
// children are passed to it. The component is useful for creating clear,
// sub-sections on a page because it was built to reuse the styling and
// functionality of a heading and the option to show a link. You can find an
// example of its use on studio.code.org/home.

const contentWidth = styleConstants['content-width'];

const styles = {
  box: {
    width: contentWidth,
    marginBottom: 60,
  },
  heading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    fontFamily: 'Gotham 3r',
    zIndex: 2,
    color: color.charcoal,
    width: contentWidth
  },
  description: {
    fontSize: 14,
    lineHeight: '22px',
    fontFamily: 'Gotham 3r',
    zIndex: 2,
    color: color.charcoal,
    width: contentWidth,
    marginTop: -10,
    marginBottom: 10
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
  chevronRtl: {
    display: 'inline',
    color: color.teal,
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 15,
  },
  linkBox: {
    display: 'inline',
    float: 'right',
  },
  linkBoxRtl: {
    display: 'inline',
    float: 'left',
    paddingLeft: 10,
  },
  children: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  clear: {
    clear: 'both'
  },
};

class ContentContainer extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node)
    ]),
    heading: PropTypes.string,
    linkText: PropTypes.string,
    link: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    description: PropTypes.string,
  };

  render() {
    const { heading, link, linkText, description, isRtl }= this.props;
    const icon = isRtl ? "chevron-left" : "chevron-right";

    return (
      <div style={styles.box}>
        {(heading || (link && linkText)) && (
          <div style={styles.heading}>
            {heading}
            {link && linkText &&
              <div style={isRtl ? styles.linkBoxRtl : styles.linkBox}>
                <a href={link}>
                  {isRtl && <FontAwesome icon={icon} style={styles.chevronRtl}/>}
                  <div style={styles.linkToViewAll}>
                    {linkText}
                  </div>
                </a>
                <a href={link} style={{textDecoration:'none'}}>
                  {!isRtl && <FontAwesome icon={icon} style={styles.chevron}/>}
                </a>
              </div>
            }
          </div>
        )}
        {description && (
          <div style={styles.description}>
            {description}
          </div>
        )}
        <div style={styles.children}>
          {React.Children.map(this.props.children, (child, index) => {
            return (
              <div key={index}>
                {child}
              </div>
            );
          })}
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
}

export default ContentContainer;
