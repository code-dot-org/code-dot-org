import {get} from 'js-cookie';

import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';

export default () => get('language_') || DefaultLocale;
