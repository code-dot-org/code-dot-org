import Dialog, {type DialogProps} from '@code-dot-org/component-library/dialog';
import {BodyThreeText} from '@code-dot-org/component-library/typography';

import moduleStyles from './showCodeDialog.module.scss';

interface ShowCodeDialogContentProps {
  code: string;
}

const ShowCodeDialogContent = ({code}: ShowCodeDialogContentProps) => {
  return (
    <>
      <BodyThreeText>
        Even top universities teach block-based coding (e.g., Berkeley,
        Harvard). But under the hood, the blocks you have assembled can also be
        shown in JavaScript, the world's most widely used coding language:
      </BodyThreeText>
      <pre>{code}</pre>
    </>
  );
};

export interface ShowCodeDialogProps extends ShowCodeDialogContentProps {
  onClose: DialogProps['onClose'];
}

const ShowCodeDialog = ({code, onClose}: ShowCodeDialogProps) => {
  return (
    <Dialog
      title="Your Code!"
      customContent={<ShowCodeDialogContent code={code} />}
      primaryButtonProps={{
        text: 'Close',
        onClick: onClose,
      }}
      className={moduleStyles.showCodeDialog}
      closeLabel="Close Code"
      icon={{
        iconName: 'code',
        iconStyle: 'solid',
      }}
      onClose={onClose}
    />
  );
};

export default ShowCodeDialog;
