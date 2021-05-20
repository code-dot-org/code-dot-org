import React from 'react';
import i18n from '@cdo/locale';
import Special2020Banner from './Special2020Banner';

export default class VirtualHocBanner extends React.Component {
  render() {
    return (
      <Special2020Banner
        linkUrl="https://hourofcode.com/how-to/virtual"
        body1={i18n.virtualHocBannerBody1()}
        body2={i18n.virtualHocBannerBody2()}
        buttonText={i18n.virtualHocBannerLinkText()}
      />
    );
  }
}
