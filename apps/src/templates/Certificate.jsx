import React, { PropTypes, Component } from 'react';
import i18n from "@cdo/locale";
import color from "../util/color";

const styles = {
  heading: {
    color: color.teal,
    width: '100%'
  }
};

export default class Certificate extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(['applab', 'newMinecraft', 'oldMinecraft', 'other']).isRequired
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
