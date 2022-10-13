import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import styleConstants from '../../styleConstants';

export default function CertificateShare({announcement, printUrl, imageUrl}) {
  return (
    <div style={styles.wrapper}>
      <a href={printUrl}>
        <img
          src={imageUrl}
          alt={i18n.certificateForCompletion()}
          width="100%"
          style={styles.certificate}
        />
      </a>
      {announcement && (
        <TwoColumnActionBlock
          imageUrl={pegasus(announcement.image)}
          subHeading={announcement.title}
          description={announcement.body}
          buttons={[
            {
              id: announcement.buttonId,
              url: announcement.buttonUrl,
              text: announcement.buttonText
            }
          ]}
        />
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    with: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  certificate: {
    marginBottom: 20
  }
};

CertificateShare.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  printUrl: PropTypes.string.isRequired,
  announcement: PropTypes.object
};
