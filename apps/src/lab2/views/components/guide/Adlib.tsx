import {sample} from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import reactStringReplace from 'react-string-replace';

import styles from './Adlib.module.scss';

interface AdlibProps {
  template: string;
  options: {[key: string]: string[]};
  onChange: (value: string) => void;
  className?: string;
}

// This component takes a template string with placeholders in {curly braces}
// and a set of options for each placeholder, and renders the template with
// dropdowns to select the options.  When the selected options change, it calls
// onChange with the filled-in text.
const Adlib: React.FunctionComponent<AdlibProps> = ({
  template,
  options,
  onChange,
  className,
}) => {
  const [adlibOptions, setAdlibOptions] = useState<{[key: string]: string}>({});

  // Initialize defaults.
  useEffect(() => {
    const initialOptions: {[key: string]: string} = {};
    Object.keys(options).forEach(key => {
      initialOptions[key] = sample(options[key]) || '';
    });
    setAdlibOptions(initialOptions);
  }, [onChange, options]);

  // Compute filled text.
  const filledAdlibText = useMemo(() => {
    let output = template;
    Object.keys(options).forEach(key => {
      output = output.replace(`{${key}}`, adlibOptions[key]);
    });
    return output;
  }, [adlibOptions, options, template]);

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

  // Notify parent when filled text changes.
  useEffect(() => {
    onChange(filledAdlibText);
  }, [filledAdlibText, onChange]);

  return <div className={className}>{adlibHtml}</div>;
};

export default Adlib;
