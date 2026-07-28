import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React, {Component} from 'react';
import {connect} from 'react-redux';

import styleConstants from '../styleConstants';

import moduleStyles from './content-container.module.scss';

// ContentContainer provides a full-width container which will render whatever
// children are passed to it. The component is useful for creating clear,
// sub-sections on a page because it was built to reuse the styling and
// functionality of a heading and the option to show a link. You can find an
// example of its use on studio.code.org/home.

const contentWidth = styleConstants['content-width'];
const linkBoxLineHeight = '26 px';

class ContentContainer extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node),
    ]),
    heading: PropTypes.string,
    linkText: PropTypes.string,
    link: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    description: PropTypes.string,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    hideBottomMargin: PropTypes.bool,
  };

  render() {
    const {
      heading,
      link,
      linkText,
      description,
      isRtl,
      responsiveSize,
      hideBottomMargin,
    } = this.props;

    const showLinkTop = responsiveSize === 'lg' && link && linkText;
    const showLinkBottom = responsiveSize !== 'lg' && link && linkText;
    const boxStyles = styles.boxResponsive;
    const bottomMargin = hideBottomMargin ? '' : styles.bottomMargin;

    return (
      <div style={[boxStyles, bottomMargin]}>
        {(heading || (link && linkText)) && (
          <div
            className={moduleStyles.contentContainerHeading}
            style={styles.headingBox}
          >
            <MuiTypography variant="h4" gutterBottom>
              {heading}
            </MuiTypography>
            {showLinkTop && (
              <ViewAllLink link={link} linkText={linkText} isRtl={isRtl} />
            )}
          </div>
        )}
        {description && (
          <MuiTypography
            variant="body3"
            component="p"
            style={styles.description}
          >
            {description}
          </MuiTypography>
        )}
        <div style={styles.children}>
          {React.Children.map(this.props.children, (child, index) => {
            return <div key={index}>{child}</div>;
          })}
        </div>
        {showLinkBottom && (
          <div style={styles.standaloneLinkBox}>
            <ViewAllLink
              link={link}
              linkText={linkText}
              isRtl={isRtl}
              bottom={true}
            />
          </div>
        )}
        <div style={styles.clear} />
      </div>
    );
  }
}

class ViewAllLink extends Component {
  static propTypes = {
    linkText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
    bottom: PropTypes.bool,
  };

  render() {
    const {link, linkText, isRtl, bottom} = this.props;
    let linkBoxStyle;
    if (isRtl) {
      linkBoxStyle = bottom ? styles.linkBoxRtlBottom : styles.linkBoxRtl;
    } else {
      linkBoxStyle = bottom ? styles.linkBoxBottom : styles.linkBox;
    }

    return (
      <div style={linkBoxStyle}>
        <Link href={link} size="s">
          {linkText}
          <FontAwesomeV6Icon
            iconName={isRtl ? 'chevron-left' : 'chevron-right'}
            iconStyle="solid"
          />
        </Link>
      </div>
    );
  }
}

const styles = {
  box: {
    width: contentWidth,
  },
  boxResponsive: {
    width: '100%',
  },
  bottomMargin: {
    marginBottom: 60,
  },
  headingBox: {
    paddingRight: 10,
    paddingTop: 10,
    overflow: 'hidden',
    zIndex: 2,
    position: 'relative',
  },
  standaloneLinkBox: {
    paddingTop: 10,
    position: 'relative',
    clear: 'both',
  },
  linkBox: {
    display: 'inline',
    lineHeight: linkBoxLineHeight,
  },
  linkBoxRtl: {
    display: 'inline',
    float: 'left',
    paddingLeft: 10,
    position: 'absolute',
    bottom: 20,
    left: 0,
    lineHeight: linkBoxLineHeight,
  },
  linkBoxBottom: {
    display: 'inline',
    left: 0,
  },
  linkBoxRtlBottom: {
    display: 'inline',
    right: 0,
  },
  description: {
    zIndex: 2,
    width: '100%',
    marginBottom: 10,
    clear: 'both',
  },
  children: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  clear: {
    clear: 'both',
  },
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(Radium(ContentContainer));
