import classNames from 'classnames';
import React, {useEffect, useMemo} from 'react';
import reactStringReplace from 'react-string-replace';

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

interface AdlibProps {
  children?: React.ReactNode;
  adlib: AdlibType;
  adlibChoices: AdlibChoices;
  readOnly?: boolean;
  glowSpeed?: 'normal' | 'fast';
  onChoicesChange: (choices: {[key: string]: string}) => void;
  onTextChange: (promptText: string) => void;
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
  onChoicesChange,
  onTextChange,
}) => {
  const {template, options} = adlib;

  // Compute filled text.
  const filledAdlibText = useMemo(() => {
    let output = template;
    Object.keys(options).forEach(key => {
      output = output.replace(
        `{${key}}`,
        options[key].find(option => option.id === adlibChoices[key])?.text || ''
      );
    });
    return output;
  }, [adlibChoices, options, template]);

  useEffect(() => {
    onTextChange(filledAdlibText);
  }, [filledAdlibText, onTextChange]);

  /*
  // Compute joined choices text.
  const choices = useMemo(() => {
    const output = Object.keys(options).map(key => {
      return adlibChoices[key];
    });
    return output;
  }, [adlibChoices, options]);
  */

  // Compute HTML.
  const adlibHtml = useMemo(() => {
    let output: React.ReactNode[] = [template];
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
                {option.text}
              </option>
            ))}
          </select>
        );
      });
    });

    return output;
  }, [adlibChoices, onChoicesChange, options, template]);

  /*
  // Notify parent when choices change.
  useEffect(() => {
    onChange(filledAdlibText, choices);
  }, [choices, filledAdlibText, onChange]);
  */

  return (
    <div
      className={classNames(
        styles.adlib,
        glowSpeed === 'fast'
          ? styles.adlibFastGlowSpeed
          : glowSpeed === 'normal'
          ? styles.adlibNormalGlowSpeed
          : undefined
      )}
    >
      <div className={styles.adlibInner}>
        <div>{readOnly ? filledAdlibText : adlibHtml}</div>
        {children}
      </div>
    </div>
  );
};

export default Adlib;
