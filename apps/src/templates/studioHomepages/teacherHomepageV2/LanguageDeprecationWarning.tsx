import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React, {FC} from 'react';

import {useLocalization} from '@cdo/apps/localization';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

const DEPRECATED_LOCALES = [
  'ca-ES', // Catalan
  'fil-PH', // Filipino
  'mn-MN', // Mongolian
  'ms-MY', // Malay
  'ro-RO', // Romanian
  'sq-AL', // Albanian
  'ur-PK', // Urdu
  'uz-UZ', // Uzbek
  'vi-VN', // Vietnamese
];

export const LanguageDeprecationWarning: FC = () => {
  const locale = useLocalization();

  if (!DEPRECATED_LOCALES.includes(locale)) return <></>;

  return (
    <Alert
      isImmediateImportance
      type={alertTypes.warning}
      text={i18n.languageDeprecationWarning_text()}
      link={{
        text: i18n.languageDeprecationWarning_link(),
        href: `https://support.code.org/hc/${locale.toLowerCase()}/articles/45296558462349--Explore-Code-org-in-Your-Language-More-Courses-for-a-Global-Audience`,
        openInNewTab: true,
        onClick: () => {
          analyticsReporter.sendEvent(
            EVENTS.LANGUAGE_DEPRECATION_WARNING_CLICKED,
            {locale}
          );
        },
      }}
    />
  );
};

export default LanguageDeprecationWarning;
