import React from 'react';

import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

// Keys match SurveyResult::ETHNICITIES; the POST param is diversity_<key>.
export const DIVERSITY_ETHNICITIES = [
  {key: 'asian', label: () => i18n.diversitySurveyEthnicityAsian()},
  {key: 'black', label: () => i18n.diversitySurveyEthnicityBlack()},
  {key: 'hispanic', label: () => i18n.diversitySurveyEthnicityHispanic()},
  {
    key: 'american_indian',
    label: () => i18n.diversitySurveyEthnicityAmericanIndian(),
  },
  {key: 'hawaiian', label: () => i18n.diversitySurveyEthnicityHawaiian()},
  {key: 'white', label: () => i18n.diversitySurveyEthnicityWhite()},
  {key: 'tr', label: () => i18n.diversitySurveyEthnicityTwoOrMore()},
] as const;

export type DiversityCounts = Record<string, string>;

export const EMPTY_DIVERSITY_COUNTS: DiversityCounts = Object.fromEntries(
  DIVERSITY_ETHNICITIES.map(({key}) => [key, ''])
);

interface DiversitySurveyContainerProps {
  counts: DiversityCounts;
  onChange: (key: string, value: string) => void;
}

const DiversitySurveyContainer: React.FC<DiversitySurveyContainerProps> = ({
  counts,
  onChange,
}) => (
  <fieldset className={styles.diversitySurvey}>
    <legend className={styles.diversitySurveyQuestion}>
      {i18n.diversitySurveyQuestion()}
    </legend>
    <div className={styles.diversitySurveyGrid}>
      {DIVERSITY_ETHNICITIES.map(({key, label}) => (
        <label key={key} className={styles.diversitySurveyField}>
          <input
            type="text"
            inputMode="numeric"
            name={`survey[diversity_${key}]`}
            className={styles.diversitySurveyInput}
            placeholder="0"
            maxLength={3}
            value={counts[key]}
            onChange={e => onChange(key, e.target.value.replace(/\D/g, ''))}
          />
          {label()}
        </label>
      ))}
    </div>
  </fieldset>
);

export default DiversitySurveyContainer;
