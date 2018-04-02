import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import color from "../../util/color";
import Button from '@cdo/apps/templates/Button';
import i18n from "@cdo/locale";
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
  subheading: {
    paddingRight: 0,
    paddingBottom: 20,
    fontSize: 27,
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
    width: '100%'
  },
};

class UnconnectedTwoColumnActionBlock extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    imageUrl: PropTypes.string.isRequired,
    heading: PropTypes.string,
    subHeading: PropTypes.string,
    description: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })),
  };

  render() {
    const { isRtl, responsiveSize, imageUrl, heading, subHeading, description, buttons } = this.props;
    const float = isRtl ? 'right' : 'left';
    const width = (responsiveSize === 'lg') ? '50%' : '100%';

    return (
      <div>
        {heading && (
          <div style={styles.heading}>
            {heading}
          </div>
        )}
        <div style={styles.container}>
          {responsiveSize === 'lg' &&
            <div style={{float, width}}>
              <img
                src={imageUrl}
                style={styles.image}
              />
            </div>
          }
          <div style={{float, width}}>
            <div style={styles.textItem}>
              {subHeading && (
                <div style={styles.subheading}>
                  {subHeading}
                </div>
              )}
              <div style={styles.description}>
                {description}
              </div>
              {buttons.map((button, index) =>
                <span key={index}>
                  <Button
                    href={button.url}
                    color={Button.ButtonColor.gray}
                    text={button.text}
                  />
                  &nbsp;
                  &nbsp;
                  &nbsp;
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.clear}/>
      </div>
    );
  }
}

const TwoColumnActionBlock = connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
  isRtl: state.isRtl,
}))(UnconnectedTwoColumnActionBlock);

export class LocalClassActionBlock extends Component {
  static propTypes = {
    showHeading: PropTypes.bool.isRequired,
  };

  render() {
    const { showHeading } = this.props;
    const heading = showHeading ? i18n.findLocalClassHeading() : '';

    return (
      <TwoColumnActionBlock
        imageUrl={pegasus('/shared/images/fill-540x289/misc/beyond-local-map.png')}
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
        imageUrl={pegasus('/images/fill-540x289/2015AR/newcsteacherstrained.png')}
        heading={i18n.administratorResourcesHeading()}
        subHeading={i18n.administratorResourcesSubheading()}
        description={i18n.administratorResourcesDescription()}
        buttons={[
          {
            url: pegasus('/administrators'),
            text: i18n.yourSchoolAdminButton()
          }
        ]}
      />
    );
  }
}

export class SpecialAnnouncementActionBlock extends Component {

  render() {
    return (
      <TwoColumnActionBlock
        imageUrl={pegasus('/images/professional-learning/fill-540x289/teacher-apps-4.png')}
        subHeading={i18n.specialAnnouncementHeading()}
        description={i18n.specialAnnouncementDescription()}
        buttons={[
          {
            url: pegasus('/educate/professional-learning-2018'),
            text: i18n.learnMore()
          },
        ]}
      />
    );
  }
}
