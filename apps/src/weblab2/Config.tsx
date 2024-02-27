import React, {useState} from 'react';
import './styles/config.css';

import {ProjectType, ConfigType} from './CDOIDE/types';

type ConfigProps = {
  config: ProjectType | ConfigType;
  setConfig: (name: string, config: ProjectType | ConfigType) => void;
  configName: string;
  cancelConfig: () => void;
};

export const Config = ({
  config,
  setConfig,
  configName,
  cancelConfig,
}: ConfigProps) => {
  const [localConfig, setLocalConfig] = useState(
    JSON.stringify(config, undefined, 2)
  );
  const [isValid, setIsValid] = useState(true);
  return (
    <div className="config-modal">
      <div>Configuring {configName}</div>
      <textarea
        rows={20}
        cols={50}
        value={localConfig}
        onChange={e => {
          const val = e.target.value;
          setLocalConfig(val);
          try {
            JSON.parse(val);
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
          onClick={() => setConfig(configName, JSON.parse(localConfig))}
          disabled={!isValid}
        >
          Save changes
        </button>
      </div>
    </div>
  );
};
