import React from 'react';
import PropTypes from 'prop-types';
import experiments from '@cdo/apps/util/experiments';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SetupInstructions from '@cdo/apps/lib/kits/maker/ui/SetupInstructions';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {isCodeOrgBrowser, getChromeVersion} from '../util/browserChecks';
import applabI18n from '@cdo/applab/locale';
import i18n from '@cdo/locale';
import {MAKER_DEPRECATION_SUPPORT_URL} from '../util/makerConstants';

const style = {
  twoColumns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  descriptionFlexCard: {
    width: '45%'
  },
  circuitPlaygroundImg: {
    float: 'right',
    margin: '0 0 15px 10px',
    borderRadius: '50%'
  },
  microbitImg: {
    float: 'right',
    margin: '0 0 15px 10px'
  }
};

export default class SetupGuide extends React.Component {
  setupGuideContent = content => {
    switch (content) {
      case 'microbit':
        return {
          id: 'microbit-description',
          title: applabI18n.makerSetupMicrobitTitle(),
          href: 'https://microbit.org/',
          imgSrc: '/blockly/media/maker/microbit-drawing-green.png',
          description: applabI18n.makerSetupMicrobitDescription(),
          imgStyle: style.microbitImg,
          alt: applabI18n.makerSetupMicrobitImageAltText()
        };
      case 'circuitPlayground':
        return {
          id: 'circuit-playground-description',
          title: applabI18n.makerSetupCircuitPlaygroundTitle(),
          href:
            'https://learn.adafruit.com/introducing-circuit-playground/overview',
          imgSrc: '/blockly/media/maker/circuit-playground-x-1.png',
          description: applabI18n.makerSetupCircuitPlaygroundDescription(),
          imgStyle: style.circuitPlaygroundImg,
          alt: applabI18n.makerSetupCircuitPlaygroundImageAltText()
        };
    }
  };

  render() {
    // Experiment 'microbit', displays Circuit Playground and Micro:Bit descriptions.
    const isMicrobit = experiments.isEnabled('microbit');
    const chromeVersion = getChromeVersion();

    return (
      <div>
        {isCodeOrgBrowser() && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.makerSetupDeprecationWarningAppTitle()}
            details={i18n.makerSetupDeprecationWarningAppDetails()}
            detailsLinkText={i18n.makerDeprecationWarningLinkText()}
            detailsLink={MAKER_DEPRECATION_SUPPORT_URL}
            dismissible
          />
        )}
        {chromeVersion && chromeVersion <= 90 && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.makerSetupDeprecationWarningOldChromeTitle()}
            details={i18n.makerSetupDeprecationWarningOldChromeDetails()}
            detailsLinkText={i18n.makerDeprecationWarningLinkText()}
            detailsLink={MAKER_DEPRECATION_SUPPORT_URL}
            dismissible
          />
        )}
        <h1>{applabI18n.makerSetupPageTitle()}</h1>
        {isMicrobit ? (
          <div style={style.twoColumns}>
            <DescriptionCard
              {...this.setupGuideContent('circuitPlayground')}
              divStyle={style.descriptionFlexCard}
            />
            <DescriptionCard
              {...this.setupGuideContent('microbit')}
              divStyle={style.descriptionFlexCard}
            />
          </div>
        ) : (
          <DescriptionCard {...this.setupGuideContent('circuitPlayground')} />
        )}
        <div id="setup-status-mount">
          <SetupInstructions />
        </div>
      </div>
    );
  }
}

function DescriptionCard(props) {
  return (
    <div id={props.id} style={props.divStyle}>
      <h2>{props.title}</h2>
      <center>
        <a href={props.href}>
          <img
            src={props.imgSrc}
            width={200}
            style={props.imgStyle}
            alt={props.alt}
          />
        </a>
      </center>
      <div className="description-content">
        <SafeMarkdown markdown={props.description} />
      </div>
    </div>
  );
}
DescriptionCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  imgStyle: PropTypes.object,
  description: PropTypes.string.isRequired,
  divStyle: PropTypes.object,
  alt: PropTypes.string.isRequired
};
