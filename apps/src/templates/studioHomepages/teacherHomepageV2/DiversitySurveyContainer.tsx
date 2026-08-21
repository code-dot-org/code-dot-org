import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

// Mirrors SurveyResult::ETHNICITIES (dashboard/app/models/survey_result.rb), in
// the same order. Each `key` maps to the legacy `diversity_<key>` param.
const ETHNICITIES: {key: string; label: () => string}[] = [
  {key: 'asian', label: i18n.diversitySurveyEthnicityAsian},
  {key: 'black', label: i18n.diversitySurveyEthnicityBlack},
  {key: 'hispanic', label: i18n.diversitySurveyEthnicityHispanic},
  {key: 'american_indian', label: i18n.diversitySurveyEthnicityAmericanIndian},
  {key: 'hawaiian', label: i18n.diversitySurveyEthnicityHawaiian},
  {key: 'white', label: i18n.diversitySurveyEthnicityWhite},
  {key: 'tr', label: i18n.diversitySurveyEthnicityTr},
];

// Matches SurveyResult::DIVERSITY_2026.
const DIVERSITY_KIND = 'Diversity2026';

export interface DiversitySurveyHandle {
  submit: () => void;
}

interface DiversitySurveyContainerProps {
  onCompleteCallback: () => void;
}

const DiversitySurveyContainer = React.forwardRef<
  DiversitySurveyHandle,
  DiversitySurveyContainerProps
>(({onCompleteCallback}, ref) => {
  const [counts, setCounts] = React.useState<Record<string, string>>({});

  const onChange = (key: string, value: string) => {
    // Constrain to non-negative integers, mirroring the legacy survey.
    setCounts(prev => ({...prev, [key]: value.replace(/[^0-9]/g, '')}));
  };

  const submit = React.useCallback(() => {
    // Send string values to match the legacy form-encoded submission; the
    // SurveyResultsController re-encodes each param and chokes on non-strings.
    const survey: Record<string, string> = {kind: DIVERSITY_KIND};
    ETHNICITIES.forEach(({key}) => {
      survey[`diversity_${key}`] = counts[key]?.replace(/[^0-9]/g, '') || '0';
    });

    HttpClient.post('/survey_results', JSON.stringify({survey}), true, {
      'Content-Type': 'application/json',
    })
      .then(() => onCompleteCallback())
      .catch(error => console.error(error));
  }, [counts, onCompleteCallback]);

  React.useImperativeHandle(ref, () => ({submit}), [submit]);

  return (
    <div className={styles.diversitySurveyContainer}>
      <Typography
        variant="body2"
        gutterBottom
        className={styles.diversitySurveyPrompt}
      >
        {i18n.diversitySurveyPrompt()}
      </Typography>
      <div className={styles.diversitySurveyOptions}>
        {ETHNICITIES.map(e => (
          <div key={e.key} className={styles.diversitySurveyRow}>
            <TextField
              className={styles.diversitySurveyInput}
              name={`diversity_${e.key}`}
              inputType="number"
              value={counts[e.key] ?? ''}
              placeholder="0"
              maxLength={3}
              aria-label={e.label()}
              onChange={event => onChange(e.key, event.target.value)}
            />
            <Typography variant="body2">{e.label()}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
});

DiversitySurveyContainer.displayName = 'DiversitySurveyContainer';

export default DiversitySurveyContainer;
