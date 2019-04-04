import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '../../util/color';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  heading: {
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    lineHeight: '26px',
    fontFamily: 'Gotham 3r',
    color: color.charcoal
  },
  textItem: {
    backgroundColor: color.teal,
    padding: 25,
    minHeight: 260,
    boxSizing: 'border-box'
  },
  textItemCyan: {
    backgroundColor: color.light_cyan,
    padding: 25,
    minHeight: 260,
    boxSizing: 'border-box'
  },
  subHeading: {
    paddingRight: 0,
    paddingBottom: 20,
    fontSize: 27,
    lineHeight: 1.2,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white
  },
  subHeadingSmallFont: {
    paddingRight: 0,
    paddingBottom: 20,
    fontSize: 25,
    lineHeight: 1.2,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white
  },
  image: {
    width: 485,
    minHeight: 260
  },
  description: {
    paddingRight: 10,
    paddingBottom: 20,
    fontSize: 14,
    fontFamily: 'Gotham 4r',
    lineHeight: '22px',
    color: color.white
  },
  clear: {
    clear: 'both',
    marginBottom: 60
  },
  container: {
    width: '100%',
    position: 'relative'
  }
};

export class UnconnectedTwoColumnActionBlock extends Component {
  static propTypes = {
    id: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    imageUrl: PropTypes.string.isRequired,
    imageExtra: PropTypes.node,
    teacherStyle: PropTypes.bool,
    heading: PropTypes.string,
    subHeading: PropTypes.string,
    subHeadingSmallFont: PropTypes.bool,
    description: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        target: PropTypes.string,
        id: PropTypes.string
      })
    )
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
      buttons
    } = this.props;
    const float = isRtl ? 'right' : 'left';
    const width = responsiveSize === 'lg' ? '50%' : '100%';

    return (
      <div id={id} style={styles.container}>
        {heading && <div style={styles.heading}>{heading}</div>}
        <div style={styles.container}>
          {responsiveSize === 'lg' && (
            <div style={{float, width}}>
              <img src={imageUrl} style={styles.image} />
              {imageExtra}
            </div>
          )}
          <div style={{float, width}}>
            <div
              style={
                this.props.teacherStyle ? styles.textItemCyan : styles.textItem
              }
            >
              {subHeading && (
                <div
                  style={
                    subHeadingSmallFont
                      ? styles.subHeadingSmallFont
                      : styles.subHeading
                  }
                >
                  {subHeading}
                </div>
              )}
              <div style={styles.description}>{description}</div>
              {buttons.map((button, index) => (
                <span key={index}>
                  <Button
                    href={button.url}
                    color={Button.ButtonColor.gray}
                    text={button.text}
                    target={button.target}
                    id={button.id}
                  />
                  &nbsp; &nbsp; &nbsp;
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={styles.clear} />
      </div>
    );
  }
}

export const TwoColumnActionBlock = connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl
}))(UnconnectedTwoColumnActionBlock);

export class LocalClassActionBlock extends Component {
  static propTypes = {
    showHeading: PropTypes.bool.isRequired
  };

  render() {
    const {showHeading} = this.props;
    const heading = showHeading ? i18n.findLocalClassHeading() : '';

    return (
      <TwoColumnActionBlock
        imageUrl={pegasus(
          '/shared/images/fill-540x289/misc/beyond-local-map.png'
        )}
        heading={heading}
        subHeading={i18n.findLocalClassSubheading()}
        description={i18n.findLocalClassDescription()}
        buttons={[
          {
            url: pegasus('/learn/local'),
            text: i18n.findLocalClassButton()
          }
        ]}
      />
    );
  }
}

export class AdministratorResourcesActionBlock extends Component {
  render() {
    return (
      <TwoColumnActionBlock
        imageUrl={pegasus(
          '/images/fill-540x289/2015AR/newcsteacherstrained.png'
        )}
        heading={i18n.administratorResourcesHeading()}
        description={i18n.administratorResourcesDescription()}
        buttons={[
          {
            id: 'your_school_professional_learning',
            url: pegasus('/educate/professional-learning'),
            text: i18n.yourSchoolProfessionalLearningProgramsButton()
          },
          {
            id: 'your_school_administrators',
            url: pegasus('/administrators'),
            text: i18n.yourSchoolAdminButton()
          }
        ]}
      />
    );
  }
}

export class SpecialAnnouncementActionBlock extends Component {
  static propTypes = {
    hocLaunch: PropTypes.string,
    hasIncompleteApplication: PropTypes.bool
  };

  render() {
    return !!this.props.hasIncompleteApplication ? (
      <TwoColumnActionBlock
        id="teacher-application-continue-announcement"
        imageUrl={pegasus(
          '/shared/images/fill-540x289/teacher-announcement/professional-learning-2019-3.jpg'
        )}
        subHeading={
          'Finish your application to the Professional Learning Program'
        }
        subHeadingSmallFont={true}
        description={
          'We noticed you started your application to the Code.org Professional Learning Program.\
          Finish your application while seats last!'
        }
        buttons={[
          {
            id: 'teacher-application-continue-button',
            url: '/pd/application/teacher',
            text: 'Finish application'
          }
        ]}
      />
    ) : (
      <TwoColumnActionBlock
        id="teacher-application-announcement"
        imageUrl={pegasus(
          '/shared/images/fill-540x289/teacher-announcement/professional-learning-2019-3.jpg'
        )}
        subHeading={i18n.specialAnnouncementHeadingJoinProfessionalLearning2019()}
        subHeadingSmallFont={true}
        description={i18n.specialAnnouncementDescriptionJoinProfessionalLearning2019()}
        imageExtra={false}
        teacherStyle={false}
        buttons={[
          {
            id: 'teacher-application-join-button',
            url: pegasus('/educate/professional-learning'),
            text: i18n.joinUs()
          }
        ]}
      />
    );
  }
}
