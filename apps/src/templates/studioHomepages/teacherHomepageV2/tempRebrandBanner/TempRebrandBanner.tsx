import CloseButton from '@code-dot-org/component-library/closeButton';
import {Typography} from '@mui/material';
import React, {useCallback, useEffect, useState} from 'react';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import backgroundPattern from '../../../../../static/rebrand_banner/teacher_dashboard_gradient_bg.png';
import bannerImage from '../../../../../static/rebrand_banner/teacher_dashboard_hero.png';

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
        backgroundImage: `url(${backgroundPattern})`,
        backgroundPositionX: '0%',
        backgroundPositionY: '0%',
        backgroundSize: '200px 200px',
        backgroundRepeat: 'repeat-x',
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
          <Typography color="textPrimary" variant="h2">
            {i18n.rebrandBannerHeader()}
          </Typography>
          <Typography variant="h4">{i18n.rebrandBannerSubheader()}</Typography>
        </div>
        <Typography variant="body3">{i18n.rebrandBannerText()}</Typography>
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
