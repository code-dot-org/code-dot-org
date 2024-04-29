import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {Alert} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import i18n from '@cdo/locale';

import styles from './coming-soon-banner.module.scss';

export default function ComingSoonBanner({canShow}) {
  const [closed, setClosed] = React.useState(false);

  return (
    <>
      {!closed && (
        <Alert
          key="coming-soon-banner"
          className={styles.comingSoonBanner}
          bsStyle="info"
          closeLabel={i18n.closeDialog()}
          onDismiss={() => setClosed(true)}
        >
          <div className={styles.bannerText}>
            <span className={styles.icon}>
              <FontAwesomeV6Icon
                iconStyle="solid"
                iconName="megaphone"
                className={classNames('fa-rotate-90', styles.megaphone)}
              />
            </span>
            <span>
              <b>{i18n.progressV2_comingSoon()}</b>{' '}
              {i18n.progressV2_comingSoonBanner()}
            </span>
          </div>
        </Alert>
      )}
    </>
  );
}

ComingSoonBanner.propTypes = {
  canShow: PropTypes.bool,
};
