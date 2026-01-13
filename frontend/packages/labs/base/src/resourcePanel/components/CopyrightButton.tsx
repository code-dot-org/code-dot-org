import type {FunctionComponent} from 'react';
import {useMemo, useState} from 'react';

import {Theme} from '@code-dot-org/component-library/common/contexts';

import CopyrightDialog from '../../components/CopyrightDialog';

import ButtonWithDialog from './ButtonWithDialog';

interface CopyrightButtonProps {
  theme: Theme;
}

const CopyrightButton: FunctionComponent<CopyrightButtonProps> = ({theme}) => {
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(false);
  const innerDialog = useMemo(
    () => (
      <div data-theme={'Light'}>
        <CopyrightDialog
          isOpen={isCopyrightOpen}
          theme={theme}
          closeModal={() => setIsCopyrightOpen(false)}
        />
      </div>
    ),
    [theme, isCopyrightOpen],
  );

  return (
    <ButtonWithDialog
      text={'Copyright'}
      id={'copyright'}
      theme={theme}
      Dialog={innerDialog}
      iconName={'copyright'}
      setIsDialogOpen={setIsCopyrightOpen}
      ariaLabel={'Copyright'}
      buttonSize="s"
    />
  );
};

export default CopyrightButton;
