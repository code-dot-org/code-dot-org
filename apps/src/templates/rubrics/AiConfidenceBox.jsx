import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
import i18n from '@cdo/locale';
import {StrongText, BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import style from './rubrics.module.scss';
import classnames from 'classnames';

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
    <div className={style.aiConfidenceBox}>
      <div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={classnames(style.aiConfidenceBar, aiConfidenceStyle)}
          />
        ))}
      </div>
      <div className={style.aiConfidenceBoxText}>
        <BodyThreeText>
          <StrongText>{aiConfidenceText}</StrongText>
          <span data-tip data-for="info-tip">
            <FontAwesome icon="info-circle" className={style.infoTipIcon} />
          </span>
        </BodyThreeText>
        <ReactTooltip id="info-tip" effect="solid">
          <div className={style.infoTipText}>{i18n.aiConfidenceTooltip()}</div>
        </ReactTooltip>
      </div>
    </div>
  );
}

AiConfidenceBox.propTypes = {
  aiConfidence: PropTypes.number,
};
