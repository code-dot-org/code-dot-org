import {makeEnum} from '@cdo/apps/utils';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

export const OAuthSectionTypes = makeEnum(
  SectionLoginType.google_classroom,
  SectionLoginType.clever,
  'microsoft_classroom'
);

export const OAuthProviders = {
  google: 'google_oauth2',
  microsoft: 'microsoft_v2_auth',
  clever: 'clever',
  facebook: 'facebook',
};

export const SingleSignOnProviders = {
  ...OAuthProviders,
  lti_v1: SectionLoginType.lti_v1,
};

export const LmsPlatformNames = {
  canvas_cloud: 'Canvas',
  canvas_beta_cloud: 'Canvas Beta',
  canvas_test_cloud: 'Canvas Test',
  schoology: 'Schoology',
};
