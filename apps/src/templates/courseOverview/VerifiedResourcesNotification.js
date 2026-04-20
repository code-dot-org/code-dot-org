import Link from '@code-dot-org/component-library/link';
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '@cdo/locale';

import styles from './courseScript.module.scss';

const VERIFIED_RESOURCES_URL =
  'https://support.code.org/hc/en-us/articles/115001550131';

export default class VerifiedResourcesNotification extends PureComponent {
  render() {
    return (
      <NotificationBanner
        variant="warning"
        title={i18n.verifiedResourcesNotice()}
        className={classNames(
          styles.verifiedResourcesNotification,
          'announcement-notification'
        )}
        description={
          this.props.inLesson
            ? i18n.verifiedResourcesLessonDetails()
            : i18n.verifiedResourcesDetails()
        }
        icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
        actions={
          <Link
            href={VERIFIED_RESOURCES_URL}
            text={i18n.learnMore()}
            type="secondary"
            size="s"
            openInNewTab
          />
        }
      />
    );
  }
}
VerifiedResourcesNotification.propTypes = {
  inLesson: PropTypes.bool,
};
