import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default function GetVerifiedBanner({courseName}) {
  return (
    <div style={styles.verifiedBanner}>
      <div>
        <i className="fa fa-warning" style={styles.warningIcon} />
      </div>
      <div>
        <h4 style={styles.title}>{i18n.getVerifiedTitle()}</h4>
        <SafeMarkdown
          markdown={i18n.getVerifiedInfo({
            courseName: courseName,
            verificationFormUrl:
              'https://docs.google.com/forms/d/e/1FAIpQLSdGGAJuaDMBVIRYnimPhAL96w6fCl4UdvhwmynGONM75TWwWw/viewform',
            verificationInfoUrl:
              'https://support.code.org/hc/en-us/articles/115001550131-How-do-I-get-a-verified-teacher-account-for-CS-Principles-CS-Discoveries-and-CSA-',
          })}
        />
      </div>
    </div>
  );
}

GetVerifiedBanner.propTypes = {
  courseName: PropTypes.string,
};

const styles = {
  verifiedBanner: {
    border: '1px solid',
    borderColor: color.goldenrod,
    borderRadius: 5,
    marginRight: 20,
    display: 'flex',
    marginTop: 5,
  },
  warningIcon: {
    color: color.goldenrod,
    fontSize: 22,
    margin: '10px 15px',
  },
  title: {
    color: color.goldenrod,
    marginTop: 10,
    fontWeight: 'bold',
  },
};
