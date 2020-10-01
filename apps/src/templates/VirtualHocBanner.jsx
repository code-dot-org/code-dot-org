import React from 'react';
import i18n from '@cdo/locale';
import HomeBanner from './HomeBanner';

export default class VirtualHocBanner extends React.Component {
  render() {
    return (
      <HomeBanner
        linkUrl="https://hourofcode.com/how-to/virtual"
        body1={i18n.virtualHocBannerBody1()}
        body2={i18n.virtualHocBannerBody2()}
        buttonText={i18n.virtualHocBannerLinkText()}
      />
    );
  }
}
