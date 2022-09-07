import React from 'react';
import PropTypes from 'prop-types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import styleConstants from '../../styleConstants';
import color from '@cdo/apps/util/color';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

export default function CertificateBatch({courseName, imageUrl}) {
  return (
    <div style={styles.wrapper}>
      <h1>Print a batch of certificates</h1>
      <img src={imageUrl} width={240} height={170} />
      <span style={styles.instructions}>
        <SafeMarkdown markdown={i18n.enterCertificateNames({courseName})} />
        {i18n.wantBlankCertificateTemplate()}{' '}
        <a href={imageUrl}>{i18n.printOneCertificateHere()}</a>
      </span>
      <br />
      <form action="/print_certificates/batch" method="post">
        <RailsAuthenticityToken />
        <input name="courseName" value={courseName} type="hidden" />
        <input name="imageUrl" value={imageUrl} type="hidden" />
        <textarea cols="40" name="studentNames" rows="10" />
        <SafeMarkdown markdown={i18n.landscapeRecommendedCertificates()} />
        <button type="submit" style={styles.submit}>
          {i18n.submit()}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    with: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 14
  },
  certificate: {
    float: 'left'
  },
  instructions: {
    display: 'inline-block',
    width: 360,
    fontSize: 14
  },
  submit: {
    background: color.orange,
    color: color.white
  }
};

CertificateBatch.propTypes = {
  courseName: PropTypes.string,
  imageUrl: PropTypes.string.isRequired
};
