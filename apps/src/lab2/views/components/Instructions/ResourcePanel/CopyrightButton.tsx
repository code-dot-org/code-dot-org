import {Theme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React, {useState} from 'react';

import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog';
import {commonI18n} from '@cdo/apps/types/locale';

import styles from './styles.module.scss';

interface CopyrightButtonProps {
  theme: Theme;
}

const CopyrightButton: React.FunctionComponent<CopyrightButtonProps> = ({
  theme,
}) => {
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(false);
  return (
    <>
      <WithTooltip
        tooltipProps={{
          text: commonI18n.copyright(),
          tooltipId: 'tooltip-copyright',
          direction: 'onRight',
          size: 'xs',
          'data-theme': theme,
        }}
      >
        <button
          type="button"
          className={styles.bottomButton}
          onClick={() => {
            setIsCopyrightOpen(true);
          }}
        >
          <FontAwesomeV6Icon iconName={'copyright'} />
        </button>
      </WithTooltip>
      {/* The copyright dialog is not themed, so we have to manually set the theme to light here. */}
      <div data-theme={'Light'}>
        <CopyrightDialog
          isOpen={isCopyrightOpen}
          closeModal={() => setIsCopyrightOpen(false)}
        />
      </div>
    </>
  );
};

export default CopyrightButton;
