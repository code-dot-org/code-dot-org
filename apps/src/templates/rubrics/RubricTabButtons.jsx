import React from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';

export default function RubricTabButtons({
  tabSelectCallback,
  selectedTab,
  showSettings,
}) {
  const TAB_NAMES = {
    RUBRIC: 'rubric',
    SETTINGS: 'settings',
  };

  return (
    <div className={style.rubricTabGroup}>
      <SegmentedButtons
        className="uitest-rubric-tab-buttons"
        selectedButtonValue={selectedTab}
        size="s"
        buttons={[
          {label: i18n.rubricTabStudent(), value: TAB_NAMES.RUBRIC},
          {
            label: i18n.rubricTabClassManagement(),
            value: TAB_NAMES.SETTINGS,
            disabled: !showSettings,
          },
        ]}
        onChange={value => tabSelectCallback(value)}
      />
    </div>
  );
}

RubricTabButtons.propTypes = {
  tabSelectCallback: PropTypes.func,
  selectedTab: PropTypes.string,
  showSettings: PropTypes.bool,
};
