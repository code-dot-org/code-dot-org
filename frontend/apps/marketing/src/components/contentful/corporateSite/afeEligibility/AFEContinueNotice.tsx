import {useStatsigClient} from '@statsig/react-bindings';

import Button from '@code-dot-org/component-library/button';
import {
  CustomDialog,
  CustomDialogProps,
} from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import {
  BodyThreeText,
  Heading2,
} from '@code-dot-org/component-library/typography';

import {getStudioUrl} from '@/config/studio';

import styles from './afeEligibility.module.scss';

const AFEContinueNotice: React.FC<Pick<CustomDialogProps, 'onClose'>> = ({
  onClose,
}) => {
  const {logEvent} = useStatsigClient();

  return (
    <CustomDialog
      className={styles.afeEligibilityNotice}
      aria-labelledby="afe-submission-notice-header"
      onClose={onClose}
    >
      <Heading2 id="afe-submission-notice-header">Almost done!</Heading2>

      <BodyThreeText id="dsco-dialog-description">
        Thank you for completing your application information for the Amazon
        Future Engineer program. To finalize your participation and start
        receiving benefits, sign up for a Code.org teacher account, or sign in
        if you already have one.
      </BodyThreeText>

      <BodyThreeText>
        Already have a Code.org account?{' '}
        <Link
          size="s"
          onClick={() => {
            logEvent('AFE Sign In Button Press');
            location.href = getStudioUrl(
              `/users/sign_in?user_return_to=${location.href}`,
            );
          }}
        >
          Sign in
        </Link>
      </BodyThreeText>

      <Button
        text="Sign up"
        onClick={() => {
          logEvent('AFE Sign Up Button Press');
          location.href = getStudioUrl(
            `/users/sign_up/login_type?user_type=teacher&user_return_to=${location.href}`,
          );
        }}
      />
    </CustomDialog>
  );
};

export default AFEContinueNotice;
