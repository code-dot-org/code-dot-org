import React from 'react';
import PropTypes from 'prop-types';
import experiments from '@cdo/apps/util/experiments';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import MakerSetupInstructions from '@cdo/apps/lib/kits/maker/ui/MakerSetupInstructions';
import applabI18n from '@cdo/applab/locale';
import i18n from '@cdo/locale';

const style = {
  main: {
    width: '80%',
    maxWidth: '800px'
  },
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

const setupGuideContent = {
  microbit: {
    class: 'microbit-description',
    title: applabI18n.makerSetupMicrobitTitle(),
    href: 'https://microbit.org/',
    imgSrc: '../assets/maker/microbit-drawing-green.png',
    description: applabI18n.makerSetupMicrobitDescription(),
    imgStyle: style.microbitImg
  },
  circuitPlayground: {
    class: 'circuit-playground-description',
    title: applabI18n.makerSetupCircuitPlaygroundTitle(),
    href: 'https://learn.adafruit.com/introducing-circuit-playground/overview',
    imgSrc: '../assets/maker/circuit-playground-200.jpg',
    description: applabI18n.makerSetupCircuitPlaygroundDescription(),
    imgStyle: style.circuitPlaygroundImg
  }
};

export default class MakerSetupGuide extends React.Component {
  render() {
    // Experiment 'microbit', displays Circuit Playground and Micro:Bit descriptions.
    let isMicrobit = experiments.isEnabled('microbit');
    return (
      <div>
        <h1>{applabI18n.makerSetupPageTitle()}</h1>
        {isMicrobit ? (
          <div style={style.twoColumns}>
            <DescriptionCard
              {...setupGuideContent.circuitPlayground}
              divStyle={style.descriptionFlexCard}
            />
            <DescriptionCard
              {...setupGuideContent.microbit}
              divStyle={style.descriptionFlexCard}
            />
          </div>
        ) : (
          <DescriptionCard {...setupGuideContent.circuitPlayground} />
        )}
        <div id="setup-status-mount">
          <MakerSetupInstructions />
        </div>
        <div className="setup-support">
          <h2>{i18n.support()}</h2>
          <SafeMarkdown markdown={i18n.debugMakerToolkit()} />
          <SafeMarkdown markdown={i18n.contactGeneralSupport()} />
        </div>
      </div>
    );
  }
}

function DescriptionCard(props) {
  return (
    <div className={props.class} style={props.divStyle}>
      <h2>{props.title}</h2>
      <center>
        <a href={props.href}>
          <img src={props.imgSrc} width={200} style={props.imgStyle} />
        </a>
      </center>
      <div className="description-content">
        <SafeMarkdown markdown={props.description} />
      </div>
    </div>
  );
}
DescriptionCard.propTypes = {
  class: PropTypes.string,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  imgStyle: PropTypes.object,
  description: PropTypes.string.isRequired,
  divStyle: PropTypes.object
};
