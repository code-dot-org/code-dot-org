import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import Button from '@cdo/apps/templates/Button';
import {stringifyQueryParams} from '@cdo/apps/utils';
import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';
import {getStore} from '@cdo/apps/redux';

export default class MiniViewTopRow extends React.Component {
  static propTypes = {
    scriptName: PropTypes.string.isRequired,
    // May not have this (i.e if not logged in)
    linesOfCodeText: PropTypes.string,
    selectedSectionId: PropTypes.string
  };

  render() {
    const {scriptName, linesOfCodeText, selectedSectionId} = this.props;
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

    return (
      <div style={styles.main}>
        <Button
          __useDeprecatedTag
          text={i18n.viewUnitOverview()}
          href={`/s/${scriptName}${params}`}
          color={Button.ButtonColor.gray}
          style={isRtl ? styles.buttonRtl : styles.button}
        />
        <span
          style={isRtl ? styles.linesOfCodeTextRtl : styles.linesOfCodeText}
        >
          {linesOfCodeText}
        </span>
        <div style={isRtl ? styles.toggleRtl : styles.toggle}>
          <ProgressDetailToggle activeColor={color.teal} whiteBorder={true} />
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
    lineHeight: '34px'
  },
  // absolutely position children so that they're located correctly in RTL as well
  button: {
    position: 'absolute',
    left: 15
  },
  buttonRtl: {
    position: 'absolute',
    right: 15
  },
  linesOfCodeText: {
    position: 'absolute',
    right: 115
  },
  linesOfCodeTextRtl: {
    position: 'absolute',
    left: 115
  },
  toggle: {
    position: 'absolute',
    top: 10,
    right: 15
  },
  toggleRtl: {
    position: 'absolute',
    top: 10,
    left: 15,
    direction: 'ltr'
  }
};
