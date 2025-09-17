import {sample} from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import reactStringReplace from 'react-string-replace';

import styles from './Adlib.module.scss';

export type AdlibType = {
  template: string;
  options: {[key: string]: string[]};
  variantCount: number;
};

export type AdlibsType = {
  [key: string]: AdlibType;
};

interface AdlibProps {
  adlib: AdlibType;
  onChange: (value: string, choices: string[]) => void;
  className?: string;
}

// This component takes a template string with placeholders in {curly braces}
// and a set of options for each placeholder, and renders the template with
// dropdowns to select the options.  When the selected options change, it calls
// onChange with the filled-in text.
const Adlib: React.FunctionComponent<AdlibProps> = ({
  adlib,
  onChange,
  className,
}) => {
  const [adlibOptions, setAdlibOptions] = useState<{[key: string]: string}>({});
  const {template, options} = adlib;

  // Initialize defaults.
  useEffect(() => {
    const initialOptions: {[key: string]: string} = {};
    Object.keys(options).forEach(key => {
      initialOptions[key] = sample(options[key]) || '';
    });
    setAdlibOptions(initialOptions);
  }, [options]);

  // Compute filled text.
  const filledAdlibText = useMemo(() => {
    let output = template;
    Object.keys(options).forEach(key => {
      output = output.replace(`{${key}}`, adlibOptions[key]);
    });
    return output;
  }, [adlibOptions, options, template]);

  // Compute joined choices text.
  const choices = useMemo(() => {
    const output = Object.keys(options).map(key => {
      return adlibOptions[key];
    });
    return output;
  }, [adlibOptions, options]);

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
            value={adlibOptions[key]}
            onChange={event => {
              setAdlibOptions({
                ...adlibOptions,
                [key]: event.target.value,
              });
            }}
          >
            {options[key].map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      });
    });

    return output;
  }, [adlibOptions, options, template]);

  // Notify parent when choices change.
  useEffect(() => {
    onChange(filledAdlibText, choices);
  }, [adlibOptions, choices, filledAdlibText, onChange]);

  return <div className={className}>{adlibHtml}</div>;
};

export default Adlib;
