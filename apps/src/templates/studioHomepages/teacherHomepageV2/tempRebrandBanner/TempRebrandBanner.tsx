import CloseButton from '@code-dot-org/component-library/closeButton';
import {Button, Typography} from '@mui/material';
import React, {useCallback, useEffect, useState} from 'react';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import bannerImage from '../../../../../static/rebrand_banner/rebrand_banner_hero.png';

import style from './tempRebrandBanner.module.scss';

interface TempRebrandBannerProps {
  showBanner: boolean;
}
export const TempRebrandBanner: React.FC<TempRebrandBannerProps> = ({
  showBanner,
}) => {
  const bannerLocalStorageKey = '2026-codeai-rebrand-banner';
  const [displayBanner, setDisplayBanner] = useState(showBanner);

  const getLocalStorageBannerKey = useCallback(() => {
    return `${bannerLocalStorageKey}`;
  }, [bannerLocalStorageKey]);

  useEffect(() => {
    const bannerKey = getLocalStorageBannerKey();
    const displayBannerValue = tryGetLocalStorage(bannerKey, 'true');
    setDisplayBanner(displayBannerValue !== 'false');
  }, [getLocalStorageBannerKey]);

  const onDismiss = () => {
    const bannerKey = getLocalStorageBannerKey();
    trySetLocalStorage(bannerKey, 'false');
    setDisplayBanner(false);
  };

  return (
    <div
      data-theme={'Dark'}
      id="rebrand-announcement-banner"
      className={style.container}
      style={{
        display: displayBanner ? 'flex' : 'none',
      }}
    >
      <img
        src={bannerImage}
        alt="two students working on laptops"
        className={style.imageStyle}
      />
      <div className={style.textStyle}>
        <div>
          <Typography variant="h2" className={style.textStyleFontHeaders}>
            {i18n.rebrandBannerSubheader()}
          </Typography>
        </div>
        <Typography variant="body3" className={style.textStyleFontBody}>
          {i18n.rebrandBannerText()}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          type="button"
          href="https://code.org/en-US/codeai#faq"
          className={style.linkButtonStyle}
        >
          {i18n.rebrandBannerButton()}
        </Button>
      </div>
      <CloseButton
        aria-label="close rebrand notification"
        onClick={onDismiss}
        size={'m'}
        className={style.dismissButtonStyle}
      />
    </div>
  );
};
