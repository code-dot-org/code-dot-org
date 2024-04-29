import PropTypes from 'prop-types';
import React from 'react';
import {Alert} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import styles from './coming-soon-banner.module.scss';

const LOCAL_STORAGE_KEY = 'progress-v2-coming-soon-closed';

export default function ComingSoonBanner({canShow}) {
  const [closed, setClosed] = React.useState(() => {
    const localStorageClosed = tryGetLocalStorage(LOCAL_STORAGE_KEY, 'false');

    return localStorageClosed === 'true';
  });

  const closeBanner = () => {
    setClosed(true);
    trySetLocalStorage(LOCAL_STORAGE_KEY, 'true');
  };

  return (
    <>
      {!closed && canShow && (
        <Alert
          key="coming-soon-banner"
          className={styles.comingSoonBanner}
          bsStyle="info"
          closeLabel={i18n.closeDialog()}
          onDismiss={closeBanner}
        >
          <div className={styles.bannerText}>
            <span className={styles.icon}>
              <FontAwesomeV6Icon
                iconStyle="solid"
                iconName="megaphone"
                className={styles.megaphone}
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
