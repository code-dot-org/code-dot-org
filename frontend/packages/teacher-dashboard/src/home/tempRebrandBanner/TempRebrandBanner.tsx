import CloseButton from '@code-dot-org/component-library/closeButton';
import HeroBanner from '@code-dot-org/component-library/heroBanner';
import React, {useEffect, useState} from 'react';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import bannerImage from '@cdo/static/rebrand_banner/rebrand_banner_hero.png';

import style from './tempRebrandBanner.module.scss';

const BANNER_STORAGE_KEY = '2026-codeai-rebrand-banner';

interface TempRebrandBannerProps {
  showBanner: boolean;
}

export const TempRebrandBanner: React.FC<TempRebrandBannerProps> = ({
  showBanner,
}) => {
  // Start hidden to avoid a flash when localStorage says the user already dismissed.
  const [displayBanner, setDisplayBanner] = useState(false);

  useEffect(() => {
    if (!showBanner) return;
    const stored = tryGetLocalStorage(BANNER_STORAGE_KEY, 'true');
    setDisplayBanner(stored !== 'false');
  }, [showBanner]);

  const onDismiss = () => {
    trySetLocalStorage(BANNER_STORAGE_KEY, 'false');
    setDisplayBanner(false);
  };

  if (!displayBanner) return null;

  return (
    <div id="rebrand-announcement-banner" className={style.bannerWrapper}>
      <HeroBanner
        data-theme="Dark"
        heading={
          <span className={style.heading}>{i18n.rebrandBannerSubheader()}</span>
        }
        description={i18n.rebrandBannerText()}
        imageProps={{
          src: bannerImage,
          alt: 'two students working on laptops',
        }}
        hideImageOnSmallScreen
        backgroundColor="#6A62D9"
        className={style.heroBannerSection}
        buttonProps={{
          href: 'https://code.org/codeai#faq',
          children: i18n.rebrandBannerButton(),
          color: 'secondary',
          size: 'small',
        }}
      />
      <CloseButton
        aria-label="close rebrand notification"
        onClick={onDismiss}
        size={'m'}
        className={style.dismissButtonStyle}
      />
    </div>
  );
};
