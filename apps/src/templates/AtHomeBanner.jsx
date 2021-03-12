import React from 'react';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import Special2020Banner from './Special2020Banner';

export default class AtHomeBanner extends React.Component {
  render() {
    return (
      <Special2020Banner
        linkUrl={pegasus('/athome')}
        body1={i18n.atHomeBannerBody1()}
        body2={i18n.atHomeBannerBody2()}
        buttonText={i18n.atHomeBannerLinkText()}
      />
    );
  }
}
