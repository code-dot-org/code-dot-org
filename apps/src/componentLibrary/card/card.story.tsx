import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import {buttonColors, LinkButton} from '@cdo/apps/componentLibrary/button';
import {CardActions} from '@cdo/apps/componentLibrary/card/CardActions';
import {CardContent} from '@cdo/apps/componentLibrary/card/CardContent';
import {CardHeader} from '@cdo/apps/componentLibrary/card/CardHeader';
import i18n from '@cdo/locale';

import {Card} from './Card';

import cardStyles from '@cdo/apps/componentLibrary/card/Card/card.module.scss';
import styles from '@cdo/apps/lib/ui/simpleSignUp/link-account.module.scss';

const meta: Meta<typeof Card> = {
  title: 'DesignSystem/Card', // eslint-disable-line storybook/no-title-property-in-meta
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const UserSignupCard: Story = {
  render: () => (
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
