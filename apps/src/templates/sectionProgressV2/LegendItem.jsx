import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@cdo/apps/code-studio/components/Icon';
import './section-progress-refresh.scss';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';

export default function LegendItem({iconId, labelText}) {
  return (
    <div className="legend-item">
      <Icon
        className="v-icon"
        iconClassName="v6-icon"
        iconId={iconId}
        padding="none"
        scale="one-x"
        style="solid"
      />
      <BodyThreeText>{labelText}</BodyThreeText>
    </div>
  );
}

LegendItem.propTypes = {
  iconId: PropTypes.string.isRequired,
  labelText: PropTypes.string,
};
