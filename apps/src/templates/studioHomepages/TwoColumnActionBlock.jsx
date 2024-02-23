import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import shapes from './shapes';
import {
  Heading2,
  BodyOneText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import styles from './twoColumnActionBlock.module.scss';

export class UnconnectedTwoColumnActionBlock extends Component {
  static propTypes = {
    id: PropTypes.string,
    imageUrl: PropTypes.string.isRequired,
    heading: PropTypes.string,
    subHeading: PropTypes.string,
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
      imageUrl,
      heading,
      subHeading,
      description,
      buttons,
      marginBottom = '64px',
    } = this.props;

    return (
      <div id={id} className={styles.container}>
        {heading && <Heading2>{heading}</Heading2>}
        <div
          className={styles.actionBlockWrapper}
          style={{marginBottom: marginBottom}}
        >
          <img src={imageUrl} alt="" className={styles.image} />
          <div className={styles.contentWrapper}>
            {subHeading && (
              <BodyOneText
                visualAppearance={'heading-sm'}
                className="two-column-action-block--sub-heading"
              >
                {subHeading}
              </BodyOneText>
            )}
            <BodyThreeText>{description}</BodyThreeText>
            <div className={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <span key={index}>
                  <Button
                    __useDeprecatedTag
                    href={button.url}
                    color={
                      button.color || Button.ButtonColor.brandSecondaryDefault
                    }
                    text={button.text}
                    target={button.target}
                    id={button.id}
                    onClick={button.onClick}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const TwoColumnActionBlock = UnconnectedTwoColumnActionBlock;

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
        marginBottom={this.props.marginBottom}
      />
    );
  }
}
