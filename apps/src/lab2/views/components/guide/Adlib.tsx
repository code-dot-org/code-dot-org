import classNames from 'classnames';
import React, {useEffect, useCallback, useMemo} from 'react';
import reactStringReplace from 'react-string-replace';

import localization, {useLocalization} from '@cdo/apps/localization';

import styles from './Adlib.module.scss';

export type AdlibChoices = {[key: string]: string};

export type AdlibType = {
  template: string;
  options: {[key: string]: {id: string; text: string}[]};
  variantCount: number;
};

export type AdlibsType = {
  [key: string]: AdlibType;
};

export type BodyVariantCounts = {[key: string]: number};

interface AdlibProps {
  children?: React.ReactNode;
  adlib: AdlibType;
  adlibChoices: AdlibChoices;
  readOnly?: boolean;
  glowSpeed?: 'normal' | 'fast';
  hidden?: boolean;
  onChoicesChange: (choices: {[key: string]: string}) => void;
  onTextChange: (promptText: string, localizedText: string) => void;
}

// This component takes a template string with placeholders in {curly braces}
// and a set of options for each placeholder, and renders the template with
// dropdowns to select the options.  When the selected options change, it calls
// onChange with the filled-in text.
const Adlib: React.FunctionComponent<AdlibProps> = ({
  children,
  adlib,
  adlibChoices,
  readOnly,
  glowSpeed,
  hidden,
  onChoicesChange,
  onTextChange,
}) => {
  const {template, options} = adlib;

  const locale = useLocalization();

  const localizedTemplate = useMemo(
    () =>
      locale !== 'en' ? localization.translate(template, ['adlib']) : template,
    [template, locale]
  );

  const fillTemplate = useCallback(
    (template: string, chosen: {[key: string]: string}) => {
      let output = template;
      Object.keys(options).forEach(key => {
        if (chosen[key]) {
          output = output.replace(`{${key}}`, chosen[key]);
        }
      });
      return output;
    },
    [options]
  );

  // Compute filled text.
  const filledAdlibText = useMemo(
    () =>
      fillTemplate(
        template,
        Object.fromEntries(
          Object.entries(options).map(([key, value]) => [
            key,
            options[key].find(option => option.id === adlibChoices[key])
              ?.text || '',
          ])
        )
      ),
    [fillTemplate, adlibChoices, options, template]
  );
  const localizedFilledAdlibText = useMemo(
    () =>
      fillTemplate(
        localizedTemplate,
        Object.fromEntries(
          Object.entries(options).map(([key, value]) => [
            key,
            localization.translate(
              options[key].find(option => option.id === adlibChoices[key])
                ?.text || ''
            ),
          ])
        )
      ),
    [fillTemplate, adlibChoices, options, localizedTemplate]
  );

  useEffect(() => {
    onTextChange(filledAdlibText, localizedFilledAdlibText);
  }, [filledAdlibText, localizedFilledAdlibText, onTextChange]);

  // Compute HTML.
  const adlibHtml = useMemo(() => {
    let output: React.ReactNode[] = [localizedTemplate];
    Object.keys(options).forEach(key => {
      output = reactStringReplace(output, `{${key}}`, match => {
        return (
          <select
            key={key}
            id={key}
            className={styles.select}
            value={adlibChoices[key]}
            onChange={event => {
              onChoicesChange({
                ...adlibChoices,
                [key]: event.target.value,
              });
            }}
          >
            {options[key].map(option => (
              <option key={option.id} value={option.id}>
                {localization.translate(option.text)}
              </option>
            ))}
          </select>
        );
      });
    });

    return output;
  }, [adlibChoices, onChoicesChange, options, localizedTemplate]);

  return (
    <div
      data-notranslate
      className={classNames(
        styles.adlib,
        glowSpeed === 'fast'
          ? styles.adlibFastGlowSpeed
          : glowSpeed === 'normal'
          ? styles.adlibNormalGlowSpeed
          : undefined,
        hidden && styles.adlibHidden
      )}
    >
      <div
        className={classNames(
          styles.adlibInner,
          readOnly && styles.adlibInnerReadOnly
        )}
      >
        <div>{readOnly ? localizedFilledAdlibText : adlibHtml}</div>
        {children}
      </div>
    </div>
  );
};

export default Adlib;
