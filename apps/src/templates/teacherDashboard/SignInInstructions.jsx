import {Markdown} from '@code-dot-org/markdown';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import MarkdownSteps from '@cdo/apps/templates/teacherDashboard/MarkdownSteps';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import cleverCodeOrgLogo from '../../../static/teacherDashboard/cleverCodeOrgLogo.svg';

import styles from './signInInstructions.module.scss';

// A standalone section heading reads at 20px, a subheading under one at 16px.
const HEADING_VARIANT = {h2: 'h6', h3: 'label1'};

export default class SignInInstructions extends React.Component {
  static propTypes = {
    loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
    sectionCode: PropTypes.string,
    studioUrlPrefix: PropTypes.string,
    sectionProviderName: PropTypes.string,
    // h2 where this block opens a page, h3 where it sits under one.
    headingLevel: PropTypes.oneOf(['h2', 'h3']),
  };

  static defaultProps = {headingLevel: 'h2'};

  heading(text) {
    const {headingLevel} = this.props;
    return (
      <Typography
        variant={HEADING_VARIANT[headingLevel]}
        component={headingLevel}
        className={styles.heading}
      >
        {text}
      </Typography>
    );
  }

  render() {
    const {loginType, sectionCode, studioUrlPrefix} = this.props;
    const wordPicStep1 = i18n.signingInWordPic1({
      joinLink: `${studioUrlPrefix}/sections/${sectionCode}`,
      sectionCode: sectionCode,
      codeOrgLink: pegasus('/'),
    });
    const intro = text => (
      <Typography variant="body2" component="p">
        {text}
      </Typography>
    );

    return (
      <div className={styles.instructions}>
        {loginType === SectionLoginType.word && (
          <>
            {this.heading(i18n.signingInWord())}
            {intro(i18n.signingInWordIntro())}
            <MarkdownSteps
              steps={[
                wordPicStep1,
                i18n.signingInWordPic2(),
                i18n.signingInWord3(),
              ]}
            />
          </>
        )}
        {loginType === SectionLoginType.picture && (
          <>
            {this.heading(i18n.signingInPic())}
            {intro(i18n.signingInPicIntro())}
            <MarkdownSteps
              steps={[
                wordPicStep1,
                i18n.signingInWordPic2(),
                i18n.signingInPic3(),
              ]}
            />
          </>
        )}
        {loginType === SectionLoginType.email && (
          <>
            {this.heading(i18n.signingInEmail())}
            {intro(i18n.signingInEmailIntro())}
            <MarkdownSteps
              steps={[
                i18n.signingInEmailGoogle1({codeOrgLink: pegasus('/')}),
                i18n.signingInEmail2(),
              ]}
            />
          </>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <>
            {this.heading(i18n.signingInGoogle())}
            {intro(i18n.signingInGoogleIntro())}
            <MarkdownSteps
              steps={[
                i18n.signingInEmailGoogle1({codeOrgLink: pegasus('/')}),
                i18n.signingInGoogle2(),
                i18n.signingInGoogle3(),
              ]}
            />
          </>
        )}
        {loginType === SectionLoginType.clever && (
          <>
            {this.heading(i18n.signingInClever())}
            {intro(i18n.signingInCleverIntro())}
            <MarkdownSteps steps={[i18n.signingInClever1()]} />
            <div className={styles.sublistAlign}>
              <Markdown content={i18n.signingInClever1a()} />
              {intro(i18n.signingInClever1b())}
            </div>
            <MarkdownSteps steps={[i18n.signingInClever2()]} />
            <img
              className={styles.appIcon}
              src={cleverCodeOrgLogo}
              alt={i18n.codeLogoClever()}
            />
          </>
        )}
        {loginType === SectionLoginType.classlink && (
          <>
            {this.heading('Signing in with ClassLink')}
            <MarkdownSteps
              steps={[
                "1. Go to studio.code.org and click the 'Sign In' button",
                "2. Choose 'Continue with ClassLink'",
                '3. Sign-in via the ClassLink sign-in dialog',
              ]}
            />
            {intro(
              'Alternatively, students can sign into CodeAI by launching from ClassLink'
            )}
          </>
        )}
        {loginType === SectionLoginType.lti_v1 && (
          <>
            {this.heading(
              i18n.signingInLtiLoginHeader({
                providerName: this.props.sectionProviderName,
              })
            )}
            <Markdown
              content={i18n.signingInLtiLoginBody({
                providerName: this.props.sectionProviderName,
              })}
            />
          </>
        )}
      </div>
    );
  }
}
