import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';
import {getStore} from '@cdo/apps/redux';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
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
        <MuiButton
          href={overviewPath}
          variant="outlined"
          color="secondary"
          size="small"
          style={isRtl ? styles.buttonRtl : styles.button}
        >
          {i18n.viewUnitOverview()}
        </MuiButton>
        <div style={isRtl ? styles.toggleRtl : styles.toggle}>
          <ProgressDetailToggle toggleStudyGroup="mini-view" />
        </div>
      </div>
    );
  }
}

const styles = {
  main: {
    fontSize: 16,
    backgroundColor: 'var(--background-brand-teal-primary)',
    color: 'var(--text-neutral-inverse)',
    padding: 15,
    marginBottom: 0,
    // matches the lineHeight of the legacy Button height (34px) plus padding.
    height: 64,
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
