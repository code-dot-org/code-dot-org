import {Theme} from '@code-dot-org/component-library/common/contexts';
import React, {useMemo, useState} from 'react';

import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog';
import {commonI18n} from '@cdo/apps/types/locale';

import ButtonWithDialog from './ButtonWithDialog';

interface CopyrightButtonProps {
  theme: Theme;
}

const CopyrightButton: React.FunctionComponent<CopyrightButtonProps> = ({
  theme,
}) => {
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(false);
  const innerDialog = useMemo(
    () => (
      <div data-theme={'Light'}>
        <CopyrightDialog
          isOpen={isCopyrightOpen}
          closeModal={() => setIsCopyrightOpen(false)}
        />
      </div>
    ),
    [isCopyrightOpen]
  );
  return (
    <ButtonWithDialog
      text={commonI18n.copyright()}
      id={'copyright'}
      theme={theme}
      Dialog={innerDialog}
      iconName={'copyright'}
      setIsDialogOpen={setIsCopyrightOpen}
    />
  );
};

export default CopyrightButton;
