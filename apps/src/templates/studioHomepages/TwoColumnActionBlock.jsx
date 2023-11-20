import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '../../util/color';
import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import shapes from './shapes';

export class UnconnectedTwoColumnActionBlock extends Component {
  static propTypes = {
    id: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    imageUrl: PropTypes.string.isRequired,
    imageExtra: PropTypes.node,
    heading: PropTypes.string,
    subHeading: PropTypes.string,
    subHeadingSmallFont: PropTypes.bool,
    description: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        target: PropTypes.string,
        id: PropTypes.string,
        color: PropTypes.oneOf(Object.values(Button.ButtonColor)),
      })
    ),
    backgroundColor: PropTypes.string,
    marginBottom: PropTypes.string,
  };

  render() {
    const {
      id,
      isRtl,
      responsiveSize,
      imageUrl,
      imageExtra,
      heading,
      subHeading,
      subHeadingSmallFont,
      description,
      buttons,
      backgroundColor,
      marginBottom = '60px',
    } = this.props;
    const float = isRtl ? 'right' : 'left';
    const width = responsiveSize === 'lg' ? '50%' : '100%';

    const textItemCustomBackgroundColor = {
      ...styles.textItem,
      backgroundColor: backgroundColor || styles.textItem.backgroundColor,
    };

    return (
      <div id={id} style={styles.container}>
        {heading && <h4 style={styles.heading}>{heading}</h4>}
        <div style={styles.container}>
          {responsiveSize === 'lg' && (
            <div style={{float, width}}>
              <img src={imageUrl} style={styles.image} alt={heading} />
              {imageExtra}
            </div>
          )}
          <div style={{float, width}}>
            <div style={textItemCustomBackgroundColor}>
              {subHeading && (
                <div
                  style={
                    subHeadingSmallFont
                      ? styles.subHeadingSmallFont
                      : styles.subHeading
                  }
                  id="two-column-action-block--sub-heading"
                >
                  {subHeading}
                </div>
              )}
              <div style={styles.description}>{description}</div>
              {buttons.map((button, index) => (
                <span key={index}>
                  <Button
                    __useDeprecatedTag
                    href={button.url}
                    color={
                      button.color || Button.ButtonColor.brandSecondaryDefault
                    }
                    style={{marginBottom: 16}}
                    text={button.text}
                    target={button.target}
                    id={button.id}
                    onClick={button.onClick}
                  />
                  &nbsp; &nbsp; &nbsp;
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{...styles.clear, marginBottom: marginBottom}} />
      </div>
    );
  }
}

export const TwoColumnActionBlock = connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(UnconnectedTwoColumnActionBlock);

export class AdministratorResourcesActionBlock extends Component {
  render() {
    return (
      <TwoColumnActionBlock
        imageUrl={pegasus(
          '/images/fill-540x300/2015AR/newcsteacherstrained.png'
        )}
        heading={i18n.administratorResourcesHeading()}
        description={i18n.administratorResourcesDescription()}
        buttons={[
          {
            id: 'your_school_professional_learning',
            url: pegasus('/educate/professional-learning'),
            text: i18n.yourSchoolProfessionalLearningProgramsButton(),
          },
          {
            id: 'your_school_administrators',
            url: pegasus('/administrators'),
            text: i18n.yourSchoolAdminButton(),
            color: Button.ButtonColor.neutralDark,
          },
        ]}
      />
    );
  }
}

export class CscInfoActionBlock extends Component {
  render() {
    return (
      <TwoColumnActionBlock
        imageUrl={'/shared/images/fit-970/banners/csc-banner.png'}
        heading={i18n.courseInfoCscHeading()}
        description={i18n.courseInfoCscDescription()}
        buttons={[
          {
            id: 'course_info_csc',
            url: pegasus('/educate/csc'),
            text: i18n.learnMore(),
          },
        ]}
      />
    );
  }
}

export class SpecialAnnouncementActionBlock extends Component {
  static propTypes = {
    announcement: shapes.specialAnnouncement,
    marginBottom: PropTypes.string,
  };

  state = {
    buttonList: this.createButtonList(),
  };

  createButtonList() {
    const buttonList = [];
    const {announcement} = this.props;
    buttonList.push({
      id: announcement.buttonId
        ? announcement.buttonId
        : 'special-announcement-btn-1',
      url: announcement.buttonUrl,
      text: announcement.buttonText,
    });
    if (announcement.buttonUrl2 && announcement.buttonText2) {
      buttonList.push({
        id: announcement.buttonId2
          ? announcement.buttonId2
          : 'special-announcement-btn-2',
        url: announcement.buttonUrl2,
        text: announcement.buttonText2,
      });
    }
    return buttonList;
  }

  render() {
    const {announcement} = this.props;
    return (
      <TwoColumnActionBlock
        imageUrl={pegasus(announcement.image)}
        subHeading={announcement.title}
        description={announcement.body}
        buttons={this.state.buttonList}
        backgroundColor={announcement.backgroundColor}
        marginBottom={this.props.marginBottom}
      />
    );
  }
}

const styles = {
  heading: {
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 20,
    marginBottom: 0,
    fontSize: 24,
    lineHeight: '26px',
    ...fontConstants['main-font-regular'],
    color: color.neutral_dark,
  },
  textItem: {
    border: `1px solid ${color.neutral_dark20}`,
    backgroundColor: color.neutral_light,
    padding: 25,
    minHeight: 281,
    boxSizing: 'border-box',
  },
  subHeading: {
    paddingRight: 0,
    paddingBottom: 20,
    fontSize: 27,
    lineHeight: 1.2,
    ...fontConstants['main-font-bold'],
    color: color.neutral_dark,
  },
  subHeadingSmallFont: {
    paddingRight: 0,
    paddingBottom: 20,
    fontSize: 25,
    lineHeight: 1.2,
    ...fontConstants['main-font-bold'],
    color: color.neutral_dark,
  },
  image: {
    width: 485,
    minHeight: 260,
    height: 279,
    border: `1px solid ${color.neutral_dark20}`,
  },
  description: {
    paddingRight: 10,
    paddingBottom: 20,
    fontSize: 14,
    ...fontConstants['main-font-regular'],
    lineHeight: '22px',
    color: color.neutral_dark,
  },
  clear: {
    clear: 'both',
  },
  container: {
    width: '100%',
    position: 'relative',
  },
};
