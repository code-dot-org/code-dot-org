import React, {Component} from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  icon: {
    color: color.level_perfect,
  }
};

export default class CorrectAnswerIcon extends Component {
  render() {
    return (
      <div>
        <FontAwesome icon="check-circle" style={styles.icon}/>
      </div>
    );
  }
}
