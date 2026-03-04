import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';
import i18n from '@cdo/locale';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import style from './ai-differentiation.module.scss';

const AI_DIFF_HEADER_TEXT = commonI18n.aiDifferentiation_header();

interface AiDiffHeaderProps {
  closeTutor?: () => void;
  closeButtonClassName: string;
}

const AiDiffHeader: React.FC<AiDiffHeaderProps> = ({
  closeTutor,
  closeButtonClassName,
}) => {
  return (
    <div className={classNames(style.aiDiffHeader, 'ai_diff_handle')}>
      <div className={style.aiDiffHeaderLeftSide}>
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
        <span className={style.aiDiffHeaderText}>{AI_DIFF_HEADER_TEXT}</span>
        <span>
          <Tags
            tagsList={[{label: i18n.experiment()}]}
            size="s"
            className={style.headerTag}
          />
        </span>
      </div>
      <div className={style.aiDiffHeaderRightSide}>
        <MuiIconButton
          variant="text"
          color="white"
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
