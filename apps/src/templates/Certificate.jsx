import React, { PropTypes, Component } from 'react';
import i18n from "@cdo/locale";
import color from "../util/color";

const styles = {
  heading: {
    color: color.teal,
  },
};

const tutorialTypes = [
  'applab',
  '2017Minecraft',
  'pre2017Minecraft',
  'other',
];

export default class Certificate extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired
  };

  render() {
    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsCertificateHeading()}
        </h1>
      </div>
    );
  }
}
