import React from 'react';
import PropTypes from 'prop-types';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class SignInInstructions extends React.Component {
  static propTypes = {
    loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
    sectionCode: PropTypes.string,
    studioUrlPrefix: PropTypes.string
  };
  render() {
    const {loginType, sectionCode, studioUrlPrefix} = this.props;
    return (
      <div>
        {loginType === SectionLoginType.word && (
          <div>
            <h2 style={styles.heading}>{i18n.signingInWord()}</h2>
            <p>{i18n.signingInWordIntro()}</p>
            <SafeMarkdown
              markdown={i18n.signingInWordPic1({
                joinLink: `${studioUrlPrefix}/sections/${sectionCode}`,
                sectionCode: sectionCode,
                codeOrgLink: pegasus('/')
              })}
            />
            <p style={styles.listAlign}>{i18n.signingInWordPic2()}</p>
            <p style={styles.listAlign}>{i18n.signingInWord3()}</p>
          </div>
        )}
        {loginType === SectionLoginType.picture && (
          <div>
            <h2 style={styles.heading}>{i18n.signingInPic()}</h2>
            <p>{i18n.signingInPicIntro()}</p>
            <SafeMarkdown
              markdown={i18n.signingInWordPic1({
                joinLink: `${studioUrlPrefix}/sections/${sectionCode}`,
                sectionCode: sectionCode,
                codeOrgLink: pegasus('/')
              })}
            />
            <p style={styles.listAlign}>{i18n.signingInWordPic2()}</p>
            <p style={styles.listAlign}>{i18n.signingInPic3()}</p>
          </div>
        )}
        {loginType === SectionLoginType.email && (
          <div>
            <h2 style={styles.heading}>{i18n.signingInEmail()}</h2>
            <p>{i18n.signingInEmailIntro()}</p>
            <SafeMarkdown
              markdown={i18n.signingInEmailGoogle1({
                codeOrgLink: pegasus('/')
              })}
            />
            <p style={styles.listAlign}>{i18n.signingInEmail2()}</p>
          </div>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <div>
            <h2 style={styles.heading}>{i18n.signingInGoogle()}</h2>
            <p>{i18n.signingInGoogleIntro()}</p>
            <SafeMarkdown
              markdown={i18n.signingInEmailGoogle1({
                codeOrgLink: pegasus('/')
              })}
            />
            <p style={styles.listAlign}>{i18n.signingInGoogle2()}</p>
            <p style={styles.listAlign}>{i18n.signingInGoogle3()}</p>
          </div>
        )}
        {loginType === SectionLoginType.clever && (
          <div>
            <h2 style={styles.heading}>{i18n.signingInClever()}</h2>
            <p>{i18n.signingInCleverIntro()}</p>
            <p style={styles.listAlign}>{i18n.signingInClever1()}</p>
            <div style={styles.sublistAlign}>
              <SafeMarkdown markdown={i18n.signingInClever1a()} />
            </div>
            <p style={styles.sublistAlign}>{i18n.signingInClever1b()}</p>
            <p style={styles.listAlign}>{i18n.signingInClever2()}</p>
            <img
              style={styles.sublistAlign}
              src="/shared/images/clever_code_org_logo.png"
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  heading: {
    color: color.purple
  },
  listAlign: {
    marginLeft: 10
  },
  sublistAlign: {
    marginLeft: 20
  }
};
