import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import style from './ai-differentiation.module.scss';

const AI_DIFF_HEADER_TEXT = commonI18n.aiDifferentiation_header();
const AI_DIFF_HEADER_TEXT_TA = commonI18n.aiDifferentiation_headerTa();

interface AiDiffHeaderProps {
  closeTutor?: () => void;
  closeButtonClassName: string;
}

const AiDiffHeader: React.FC<AiDiffHeaderProps> = ({
  closeTutor,
  closeButtonClassName,
}) => {
  const isRebranded = experiments.isEnabled('ta-teacher-panel');
  const headerText = isRebranded ? AI_DIFF_HEADER_TEXT_TA : AI_DIFF_HEADER_TEXT;

  return (
    <div
      className={classNames(
        style.aiDiffHeader,
        isRebranded && style.aiDiffHeaderTa,
        'ai_diff_handle'
      )}
    >
      <div className={style.aiDiffHeaderLeftSide}>
        {isRebranded ? (
          <FontAwesomeV6Icon
            iconFamily="kit"
            iconName="ta"
            title={headerText}
            className={style.taMarkIcon}
          />
        ) : (
          <div className={style.aiBotHeader}>
            <img
              src={aiBotOutlineIcon}
              className={style.aiBotOutlineIcon}
              alt={AI_DIFF_HEADER_TEXT}
            />
            <div className={style.taOverlayHeader}>
              <span>{'TA'}</span>
            </div>
          </div>
        )}
        <span className={style.aiDiffHeaderText}>{headerText}</span>
      </div>
      <div className={style.aiDiffHeaderRightSide}>
        <MuiIconButton
          variant="text"
          color={isRebranded ? 'tertiary' : 'white'}
          size="small"
          className={closeButtonClassName}
          onClick={closeTutor}
          type="button"
        >
          <FontAwesomeV6Icon iconName="times" iconStyle="solid" />
        </MuiIconButton>
      </div>
    </div>
  );
};

export default AiDiffHeader;
