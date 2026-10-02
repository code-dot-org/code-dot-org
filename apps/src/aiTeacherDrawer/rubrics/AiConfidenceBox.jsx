import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Typography} from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';

import i18n from '@cdo/locale';

import style from './rubrics.module.scss';

export default function AiConfidenceBox({aiConfidence}) {
  const aiConfidenceText = useMemo(() => {
    const confidenceLevels = [i18n.low(), i18n.medium(), i18n.high()];
    const ratingText = confidenceLevels[aiConfidence - 1];
    return i18n.aiConfidence({aiConfidence: ratingText});
  }, [aiConfidence]);

  const aiConfidenceStyle = useMemo(() => {
    const confidenceStyles = [
      style.aiConfidenceBarLow,
      style.aiConfidenceBarMedium,
      style.aiConfidenceBarHigh,
    ];
    return confidenceStyles[aiConfidence - 1];
  }, [aiConfidence]);

  return (
    <div id="tour-ai-confidence" className={style.aiConfidenceBox}>
      <div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={classnames(style.aiConfidenceBar, aiConfidenceStyle)}
          />
        ))}
      </div>
      <div className={style.aiConfidenceBoxText}>
        <Typography variant="label3" className={style.labelThree}>
          {aiConfidenceText}
        </Typography>
        <WithTooltip
          tooltipProps={{
            text: i18n.aiConfidenceTooltip(),
            tooltipId: 'info-tip',
          }}
        >
          <span>
            <FontAwesomeV6Icon
              iconName="circle-info"
              className={style.infoTipIcon}
            />
          </span>
        </WithTooltip>
      </div>
    </div>
  );
}

AiConfidenceBox.propTypes = {
  aiConfidence: PropTypes.number,
};
