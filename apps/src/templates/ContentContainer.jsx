import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import FontAwesome from '../legacySharedComponents/FontAwesome';

import moduleStyles from './content-container.module.scss';

// ContentContainer provides a full-width container which will render whatever
// children are passed to it. The component is useful for creating clear,
// sub-sections on a page because it was built to reuse the styling and
// functionality of a heading and the option to show a link. You can find an
// example of its use on studio.code.org/home.

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

    return (
      <div
        className={classNames(
          moduleStyles.boxResponsive,
          !hideBottomMargin && moduleStyles.bottomMargin
        )}
      >
        {(heading || (link && linkText)) && (
          <div
            className={classNames(
              moduleStyles.contentContainerHeading,
              moduleStyles.headingBox
            )}
          >
            <h4
              className={
                isRtl ? moduleStyles.headingTextRtl : moduleStyles.headingText
              }
            >
              {heading}
            </h4>
            {showLinkTop && (
              <Link link={link} linkText={linkText} isRtl={isRtl} />
            )}
          </div>
        )}
        {description && (
          <div className={moduleStyles.description}>{description}</div>
        )}
        <div className={moduleStyles.children}>
          {React.Children.map(this.props.children, (child, index) => {
            return <div key={index}>{child}</div>;
          })}
        </div>
        {showLinkBottom && (
          <div className={moduleStyles.standaloneLinkBox}>
            <Link link={link} linkText={linkText} isRtl={isRtl} bottom={true} />
          </div>
        )}
        <div className={moduleStyles.clear} />
      </div>
    );
  }
}

class Link extends Component {
  static propTypes = {
    linkText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
    bottom: PropTypes.bool,
  };

  render() {
    const {link, linkText, isRtl, bottom} = this.props;
    let linkBoxClass;
    if (isRtl) {
      linkBoxClass = bottom
        ? moduleStyles.linkBoxRtlBottom
        : moduleStyles.linkBoxRtl;
    } else {
      linkBoxClass = bottom ? moduleStyles.linkBoxBottom : moduleStyles.linkBox;
    }
    const icon = isRtl ? 'chevron-left' : 'chevron-right';

    return (
      <div className={linkBoxClass}>
        <a className={moduleStyles.linkTag} href={link}>
          <span style={{display: 'inline-block'}}>
            {isRtl && (
              <FontAwesome icon={icon} className={moduleStyles.chevronRtl} />
            )}
          </span>
          <div className={moduleStyles.linkToViewAll}>{linkText}</div>
          <span style={{display: 'inline-block'}}>
            {!isRtl && (
              <FontAwesome icon={icon} className={moduleStyles.chevron} />
            )}
          </span>
        </a>
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(ContentContainer);
