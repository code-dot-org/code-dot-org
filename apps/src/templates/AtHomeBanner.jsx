import React from 'react';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import HomeBanner from './HomeBanner';

export default class AtHomeBanner extends React.Component {
  render() {
    return (
      <HomeBanner
        linkUrl={pegasus('/athome')}
        body1={i18n.atHomeBannerBody1()}
        body2={i18n.atHomeBannerBody2()}
        buttonText={i18n.atHomeBannerLinkText()}
      />
    );
  }
}
