import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

export default class Assigned extends Component {
  render() {
    return (
      <span style={styles.assigned} className={'uitest-assigned'}>
        <span style={styles.checkmark}>
          <FontAwesome icon="check" />
        </span>
        {i18n.assigned()}
      </span>
    );
  }
}

const styles = {
  checkmark: {
    padding: 5,
  },
  assigned: {
    color: color.level_perfect,
    fontSize: 16,
    ...fontConstants['main-font-semi-bold'],
    lineHeight: '36px',
    marginLeft: 10,
    verticalAlign: 'top',
    display: 'flex',
    alignItems: 'center',
  },
};
