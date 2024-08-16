import React from 'react';

import {BodyTwoText, Heading1} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import codeLogo from '../images/codeLogo.svg';

import styles from './account-components.module.scss';

const AccountBanner: React.FunctionComponent<{
  heading: string;
  desc: string;
  showLogo: boolean;
}> = ({heading, desc, showLogo}) => (
  <div className={styles.bannerContainer}>
    {showLogo && (
      <div className={styles.iconContainer}>
        <img src={codeLogo} alt={i18n.codeLogo()} />
      </div>
    )}

    <div className={styles.titleContainer}>
      <Heading1>{heading}</Heading1>
      <BodyTwoText className={styles.titleDesc}>{desc}</BodyTwoText>
    </div>
  </div>
);

export default AccountBanner;
