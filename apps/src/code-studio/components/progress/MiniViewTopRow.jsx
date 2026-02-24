import PropTypes from 'prop-types';
import React from 'react';

import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {getStore} from '@cdo/apps/redux';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';
import {stringifyQueryParams} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

export default class MiniViewTopRow extends React.Component {
  static propTypes = {
    scriptName: PropTypes.string.isRequired,
    courseName: PropTypes.string,
    unitPosition: PropTypes.number,
    selectedSectionId: PropTypes.number,
  };

  render() {
    const {scriptName, courseName, unitPosition, selectedSectionId} =
      this.props;
    const isRtl = getStore().getState().isRtl;

    const sectionId = queryParams('section_id');
    switch (true) {
      case !!selectedSectionId:
        updateQueryParam('section_id', selectedSectionId);
        break;
      case !!sectionId && sectionId !== 'undefined':
        updateQueryParam('section_id', sectionId);
        break;
      default:
        updateQueryParam('section_id', undefined);
    }
    const params = stringifyQueryParams(queryParams());
    let overviewPath = `/s/${scriptName}${params}`;
    if (
      experiments.isEnabled(experiments.MODULARITY) &&
      courseName &&
      unitPosition
    ) {
      overviewPath = `/courses/${courseName}/units/${unitPosition}${params}`;
    }

    return (
      <div style={styles.main}>
        <Button
          __useDeprecatedTag
          text={i18n.viewUnitOverview()}
          href={overviewPath}
          color={Button.ButtonColor.gray}
          style={isRtl ? styles.buttonRtl : styles.button}
        />
        <div style={isRtl ? styles.toggleRtl : styles.toggle}>
          <ProgressDetailToggle
            activeColor={color.teal}
            whiteBorder={true}
            toggleStudyGroup="mini-view"
          />
        </div>
      </div>
    );
  }
}

const styles = {
  main: {
    fontSize: 16,
    backgroundColor: color.teal,
    color: color.white,
    padding: 15,
    marginBottom: 0,
    // matches the lineHeight of Button,
    height: 34,
    lineHeight: '34px',
  },
  // absolutely position children so that they're located correctly in RTL as well
  button: {
    position: 'absolute',
    left: 15,
  },
  buttonRtl: {
    position: 'absolute',
    right: 15,
  },
  toggle: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  toggleRtl: {
    position: 'absolute',
    top: 10,
    left: 15,
    direction: 'ltr',
  },
};
