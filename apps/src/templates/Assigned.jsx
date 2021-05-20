import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

export default class Assigned extends Component {
  render() {
    return (
      <span style={styles.assigned} className={'uitest-assigned'}>
        <FontAwesome icon="check" />
        {i18n.assigned()}
      </span>
    );
  }
}

const styles = {
  assigned: {
    color: color.level_perfect,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    lineHeight: '36px',
    marginLeft: 10,
    verticalAlign: 'top'
  }
};
