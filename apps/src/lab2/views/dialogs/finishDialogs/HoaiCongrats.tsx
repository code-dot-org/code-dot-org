import {Theme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

interface Props {
  handleClose: () => void;
  finishUrl: string;
  theme?: Theme;
}

/**
 * Congrats dialog shown for Hour of AI activities.
 */
const HoaiCongrats: React.FC<Props> = ({handleClose, finishUrl, theme}) => {
  return (
    <Modal
      data-theme={theme}
      title="Congratulations!"
      description="You finished this Hour of AI activity. What's next?"
      primaryButtonProps={{text: 'Finish', href: finishUrl, useAsLink: true}}
      secondaryButtonProps={{text: 'Keep Playing', onClick: handleClose}}
    />
  );
};

export default HoaiCongrats;
