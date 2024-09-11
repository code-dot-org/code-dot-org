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

export const LmsLoginTypeNames = {
  clever: 'Clever',
  google_classroom: 'Google Classroom',
  canvas: 'Canvas',
  schoology: 'Schoology',
};

export const LmsLoginInstructionUrls = {
  clever:
    'https://support.code.org/hc/en-us/articles/115002716111-Setting-Up-Sections-with-Clever-Sync',
  google_classroom:
    'https://support.code.org/hc/en-us/articles/115001319312-Setting-Up-Sections-with-Google-Classroom-Sync',
  canvas:
    'https://support.code.org/hc/en-us/articles/23621973451405-Create-and-sync-rosters-with-Canvas',
  schoology:
    'https://support.code.org/hc/en-us/articles/23622036958093-Create-and-sync-rosters-with-Schoology',
};
