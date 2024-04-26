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
