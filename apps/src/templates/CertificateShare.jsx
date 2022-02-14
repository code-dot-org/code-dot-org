import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';

export default function CertificateShare(props) {
  const {announcement} = props;
  return (
    <div style={styles.wrapper}>
      <a href={props.printUrl}>
        <img
          src={props.imageUrl}
          alt={i18n.certificateForCompletion()}
          width="100%"
        />
      </a>
      <TwoColumnActionBlock
        isRtl={false}
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
    </div>
  );
}

const styles = {
  wrapper: {
    with: '100%',
    maxWidth: 980,
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

CertificateShare.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  printUrl: PropTypes.string.isRequired,
  announcement: PropTypes.object.isRequired
};
