import React, { PropTypes, Component } from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import { tutorialTypes } from './tutorialTypes.js';

const styles = {
  heading: {
    color: color.teal,
    width: '100%',
  },
  image: {
    width: '50%',
  },
};

export default class Certificate extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired
  };

  render() {
    const { completedTutorialType } = this.props;

    const minecraft = (completedTutorialType === '2017Minecraft' ||
     completedTutorialType === 'pre2017Minecraft');
    const image = minecraft ? "minecraft-cert" : "default-cert";

    const filenameToImgUrl = {
      "default-cert": require('@cdo/static/hour_of_code_certificate.jpg'),
      "minecraft-cert": require('@cdo/static/MC_Hour_Of_Code_Certificate.png'),
    };
    const imgSrc = filenameToImgUrl[image];

    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsCertificateHeading()}
        </h1>
        <div style={styles.image}>
          <img src={imgSrc}/>
        </div>
      </div>
    );
  }
}
