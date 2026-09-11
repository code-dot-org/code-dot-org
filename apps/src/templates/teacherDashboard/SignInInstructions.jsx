import {Markdown} from '@code-dot-org/markdown';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import MarkdownSteps from '@cdo/apps/templates/teacherDashboard/MarkdownSteps';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import styles from './signInInstructions.module.scss';

const Heading = ({children}) => (
  <Typography variant="label1" component="h3" className={styles.heading}>
    {children}
  </Typography>
);

Heading.propTypes = {children: PropTypes.node};

const Intro = ({children}) => (
  <Typography variant="body2" component="p">
    {children}
  </Typography>
);

Intro.propTypes = {children: PropTypes.node};

export default class SignInInstructions extends React.Component {
  static propTypes = {
    loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
    sectionCode: PropTypes.string,
    studioUrlPrefix: PropTypes.string,
    sectionProviderName: PropTypes.string,
  };
  render() {
    const {loginType, sectionCode, studioUrlPrefix} = this.props;
    const wordPicStep1 = i18n.signingInWordPic1({
      joinLink: `${studioUrlPrefix}/sections/${sectionCode}`,
      sectionCode: sectionCode,
      codeOrgLink: pegasus('/'),
    });
    return (
      <div className={styles.instructions}>
        {loginType === SectionLoginType.word && (
          <div>
            <Heading>{i18n.signingInWord()}</Heading>
            <Intro>{i18n.signingInWordIntro()}</Intro>
            <MarkdownSteps
              steps={[
                wordPicStep1,
                i18n.signingInWordPic2(),
                i18n.signingInWord3(),
              ]}
            />
          </div>
        )}
        {loginType === SectionLoginType.picture && (
          <div>
            <Heading>{i18n.signingInPic()}</Heading>
            <Intro>{i18n.signingInPicIntro()}</Intro>
            <MarkdownSteps
              steps={[
                wordPicStep1,
                i18n.signingInWordPic2(),
                i18n.signingInPic3(),
              ]}
            />
          </div>
        )}
        {loginType === SectionLoginType.email && (
          <div>
            <Heading>{i18n.signingInEmail()}</Heading>
            <Intro>{i18n.signingInEmailIntro()}</Intro>
            <MarkdownSteps
              steps={[
                i18n.signingInEmailGoogle1({codeOrgLink: pegasus('/')}),
                i18n.signingInEmail2(),
              ]}
            />
          </div>
        )}
        {loginType === SectionLoginType.google_classroom && (
          <div>
            <Heading>{i18n.signingInGoogle()}</Heading>
            <Intro>{i18n.signingInGoogleIntro()}</Intro>
            <MarkdownSteps
              steps={[
                i18n.signingInEmailGoogle1({codeOrgLink: pegasus('/')}),
                i18n.signingInGoogle2(),
                i18n.signingInGoogle3(),
              ]}
            />
          </div>
        )}
        {loginType === SectionLoginType.clever && (
          <div>
            <Heading>{i18n.signingInClever()}</Heading>
            <Intro>{i18n.signingInCleverIntro()}</Intro>
            <MarkdownSteps steps={[i18n.signingInClever1()]} />
            <div className={styles.sublistAlign}>
              <Markdown content={i18n.signingInClever1a()} />
              <Typography variant="body2" component="p">
                {i18n.signingInClever1b()}
              </Typography>
            </div>
            <MarkdownSteps steps={[i18n.signingInClever2()]} />
            <img
              className={styles.sublistAlign}
              src="/shared/images/clever_code_org_logo.png"
              alt=""
            />
          </div>
        )}
        {loginType === SectionLoginType.lti_v1 && (
          <div>
            <Heading>
              {i18n.signingInLtiLoginHeader({
                providerName: this.props.sectionProviderName,
              })}
            </Heading>
            <Markdown
              content={i18n.signingInLtiLoginBody({
                providerName: this.props.sectionProviderName,
              })}
            />
          </div>
        )}
      </div>
    );
  }
}
