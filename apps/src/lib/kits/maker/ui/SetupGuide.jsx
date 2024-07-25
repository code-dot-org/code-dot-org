import PropTypes from 'prop-types';
import React from 'react';

import applabI18n from '@cdo/applab/locale';
import SetupInstructions from '@cdo/apps/lib/kits/maker/ui/SetupInstructions';
import {
  MAKER_DEPRECATION_SUPPORT_URL,
  MIN_CHROME_VERSION,
} from '@cdo/apps/lib/kits/maker/util/makerConstants';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {isCodeOrgBrowser, getChromeVersion} from '../util/browserChecks';

export default class SetupGuide extends React.Component {
  setupGuideContent = {
    id: 'general-description',
    title: applabI18n.makerSetupGeneralTitle(),
    description: applabI18n.makerSetupGeneralDescription(),
  };

  render() {
    const chromeVersion = getChromeVersion();

    return (
      <div>
        {isCodeOrgBrowser() && (
          <Notification
            type={NotificationType.failure}
            notice={i18n.makerAppDeprecationNoticeTitle()}
            details={i18n.makerAppDeprecationNoticeDetails()}
            detailsLinkText={i18n.makerDeprecationNoticeLinkText()}
            detailsLink={MAKER_DEPRECATION_SUPPORT_URL}
            dismissible
          />
        )}
        {!isCodeOrgBrowser() &&
          chromeVersion &&
          chromeVersion < MIN_CHROME_VERSION && (
            <Notification
              type={NotificationType.warning}
              notice={i18n.makerSetupDeprecationNoticeOldChromeTitle()}
              details={i18n.makerSetupDeprecationNoticeOldChromeDetails({
                minChromeVersion: MIN_CHROME_VERSION,
              })}
              detailsLinkText={i18n.makerDeprecationNoticeLinkText()}
              detailsLink={MAKER_DEPRECATION_SUPPORT_URL}
              dismissible
            />
          )}
        <h1>{applabI18n.makerSetupPageTitle()}</h1>

        <HeaderCard {...this.setupGuideContent} />

        <div id="setup-status-mount">
          <SetupInstructions />
        </div>
      </div>
    );
  }
}

function HeaderCard({id, title, description, divStyle}) {
  return (
    <div id={id} style={divStyle}>
      <h2>{title}</h2>
      <div className="description-content">
        <SafeMarkdown markdown={description} openExternalLinksInNewTab={true} />
      </div>
    </div>
  );
}
HeaderCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  divStyle: PropTypes.object,
};
