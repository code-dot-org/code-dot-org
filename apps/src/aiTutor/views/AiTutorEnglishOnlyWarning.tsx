import React from 'react';

import {useLocalization} from '@cdo/apps/localization';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import styles from './aiTutorEnglishOnlyWarning.module.scss';

const AiTutorEnglishOnlyWarning: React.FunctionComponent = () => {
  const clientType = useAppSelector(state => state.aichat?.clientType);
  const legacyLabState = useAppSelector(state => state.pageConstants);
  const lab2Locale = useLocalization();
  const locale = legacyLabState ? legacyLabState.locale : lab2Locale;
  const isEnglishLocale =
    locale && ['en_us', 'en_gb', 'en-US', 'en-GB', 'en'].includes(locale);

  const showEnglishOnlyWarning =
    !isEnglishLocale && clientType === AiChatClientTypes.AI_TUTOR;

  return (
    <>
      {showEnglishOnlyWarning && (
        <p className={styles.message}>
          This Code.org AI chat tool only supports English; use in other
          languages is not currently recommended.
        </p>
      )}
    </>
  );
};

export default AiTutorEnglishOnlyWarning;
