import {LinkButton} from '@code-dot-org/component-library/button';
import {
  CustomDialog,
  CustomDialogProps,
} from '@code-dot-org/component-library/dialog';
import {
  BodyThreeText,
  Heading2,
} from '@code-dot-org/component-library/typography';

import styles from './afeEligibility.module.scss';

const AFESuccessNotice: React.FC<Pick<CustomDialogProps, 'onClose'>> = ({
  onClose,
}) => (
  <CustomDialog
    className={styles.afeEligibilityNotice}
    aria-labelledby="afe-submission-notice-header"
    onClose={onClose}
  >
    <Heading2 id="afe-submission-notice-header">
      Congratulations! You successfully signed up for the Amazon Future Engineer
      Program
    </Heading2>

    <BodyThreeText id="dsco-dialog-description">
      You should receive an email shortly from Amazon Future Engineer to claim
      your benefits. In the meantime, check out some of the amazing resources
      around our site.
    </BodyThreeText>

    <LinkButton href="/teach" text="Start teaching with Code.org" />
  </CustomDialog>
);

export default AFESuccessNotice;
