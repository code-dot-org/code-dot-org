import {buttonColors, LinkButton} from '@code-dot-org/component-library/button';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import {CardActions} from '@cdo/apps/sharedComponents/card/CardActions';
import {CardContent} from '@cdo/apps/sharedComponents/card/CardContent';
import {CardHeader} from '@cdo/apps/sharedComponents/card/CardHeader';
import i18n from '@cdo/locale';

import {Card} from './Card';

import cardStyles from '@cdo/apps/sharedComponents/card/Card/card.module.scss';
import styles from '@cdo/apps/simpleSignUp/link-account.module.scss';

const meta: Meta<typeof Card> = {
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const UserSignupCard: Story = {
  render: () => (
    // eslint-disable-next-line react/forbid-component-props
    <Card data-testid={'existing-account-card'}>
      <CardHeader title={i18n.ltiLinkAccountExistingAccountCardHeaderLabel()} />
      <CardContent className={cardStyles.cardContent}>
        {i18n.ltiLinkAccountExistingAccountCardContent({
          providerName: 'Canvas',
        })}
      </CardContent>
      <CardActions>
        <LinkButton
          className={styles.button}
          color={buttonColors.purple}
          type={'primary'}
          size="l"
          href={'/'}
          text={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
        />
      </CardActions>
    </Card>
  ),
};
