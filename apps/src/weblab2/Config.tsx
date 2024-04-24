import React, {useState} from 'react';
import './styles/config.css';

import {ProjectType, ConfigType} from '@cdoide/types';

type ConfigProps = {
  config: ProjectType | ConfigType | string;
  setConfig: (name: string, config: ProjectType | ConfigType | string) => void;
  configName: string;
  cancelConfig: () => void;
  Instructions?: () => JSX.Element;
};

const parseJSON = (v: string) => JSON.parse(v);
const stringifyJSON = (s: string | ProjectType | ConfigType) =>
  JSON.stringify(s, undefined, 2);

const parseString = (v: string) => v;
const stringifyString = (s: string | ProjectType | ConfigType) => s as string;

export const Config = ({
  config,
  setConfig,
  configName,
  cancelConfig,
  Instructions,
}: ConfigProps) => {
  const [stringify, parser] =
    typeof config === 'object'
      ? [stringifyJSON, parseJSON]
      : [stringifyString, parseString];

  const [localConfig, setLocalConfig] = useState(stringify(config));
  const [isValid, setIsValid] = useState(true);
  return (
    <div className="config-modal">
      <div>Configuring {configName}</div>
      {Instructions && <Instructions />}
      <textarea
        rows={20}
        cols={50}
        value={localConfig}
        onChange={e => {
          const val = e.target.value;
          setLocalConfig(val);
          try {
            parser(val);
            setIsValid(true);
          } catch (e) {
            setIsValid(false);
          }
        }}
        style={{backgroundColor: isValid ? 'white' : '#fee'}}
      />
      <div className="config-buttons">
        <button type="button" onClick={cancelConfig}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() => setConfig(configName, parser(localConfig))}
          disabled={!isValid}
        >
          Save changes
        </button>
      </div>
    </div>
  );
};
