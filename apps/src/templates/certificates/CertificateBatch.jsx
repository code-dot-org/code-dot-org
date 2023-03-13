import React, {useState} from 'react';
import PropTypes from 'prop-types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import styleConstants from '../../styleConstants';
import color from '@cdo/apps/util/color';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

export default function CertificateBatch({
  courseName,
  courseTitle,
  initialStudentNames,
  imageUrl
}) {
  const [studentNames, setStudentNames] = useState(
    initialStudentNames?.join('\n') || ''
  );

  const onChange = e => {
    setStudentNames(e.target.value);
  };

  return (
    <div style={styles.wrapper}>
      <h1>{i18n.printBatchCertificates()}</h1>
      <div style={styles.imageWrapper}>
        <img src={imageUrl} width={240} height={170} />
        <span style={styles.instructions}>
          <SafeMarkdown markdown={i18n.enterCertificateNames({courseTitle})} />
          {i18n.wantBlankCertificateTemplate()}{' '}
          <a href={imageUrl}>{i18n.printOneCertificateHere()}</a>
        </span>
      </div>
      <br />
      <form
        action="/print_certificates/batch"
        method="post"
        className={'batch-certificate-form'}
      >
        <RailsAuthenticityToken />
        <input name="courseName" value={courseName} type="hidden" />
        <textarea
          cols="40"
          name="studentNames"
          rows="10"
          style={styles.textarea}
          value={studentNames}
          onChange={onChange}
        />
        <SafeMarkdown markdown={i18n.landscapeRecommendedCertificates()} />
        <button type="submit" style={styles.submit} id="submit-button">
          {i18n.printCertificates()}
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
    fontSize: 14,
    lineHeight: '22px',
    color: 'dimgray'
  },
  imageWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  certificate: {
    float: 'left'
  },
  instructions: {
    display: 'inline-block',
    width: 360,
    marginLeft: 20
  },
  textarea: {
    width: 340
  },
  submit: {
    background: color.orange,
    color: color.white
  }
};

CertificateBatch.propTypes = {
  courseName: PropTypes.string,
  courseTitle: PropTypes.string,
  initialStudentNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  imageUrl: PropTypes.string.isRequired
};
