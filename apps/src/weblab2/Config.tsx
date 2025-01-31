import {ConfigType} from '@codebridge/types';
import React, {useState} from 'react';

import './styles/config.css';
import {MultiFileSource} from '@cdo/apps/lab2/types';

type BaseConfigProps = {configName: string; cancelConfig: () => void};

type ConfigProps = BaseConfigProps & {
  config: MultiFileSource | ConfigType;
  setConfig: (name: string, config: MultiFileSource | ConfigType) => void;
};

type LayoutConfigProps = BaseConfigProps & {
  config: ConfigType;
  setConfig: (name: string, config: ConfigType) => void;
};

const parseJSON = (v: string) => JSON.parse(v);
const stringifyJSON = (s: string | MultiFileSource | ConfigType) =>
  JSON.stringify(s, undefined, 2);

const LayoutInstructions = () => (
  <div>
    You may layout a CSS grid with the following keys:
    <ul>
      <li>editor</li>
      <li>instructions</li>
      <li>file-preview</li>
      <li>file-browser</li>
      <li>file-tabs</li>
      <li>side-bar</li>
    </ul>
  </div>
);

const LayoutConfig = ({
  config,
  setConfig,
  configName,
  cancelConfig,
}: LayoutConfigProps) => {
  const [gridLayout, setGridLayout] = useState(config.gridLayout || '');
  const [gridLayoutRows, setGridLayoutRows] = useState(
    config.gridLayoutRows || ''
  );
  const [gridLayoutColumns, setGridLayoutColumns] = useState(
    config.gridLayoutColumns || ''
  );

  return (
    <div className="config-modal">
      <div>Configuring {configName}</div>
      <LayoutInstructions />
      <div className="config-layout-modal-grid">
        <div>Grid Layout Rows:</div>
        <div>
          <input
            type="text"
            value={gridLayoutRows}
            onChange={e => setGridLayoutRows(e.target.value)}
          />
        </div>
        <div>Grid Layout Columns:</div>
        <div>
          <input
            type="text"
            value={gridLayoutColumns}
            onChange={e => setGridLayoutColumns(e.target.value)}
          />
        </div>
        <div>
          <textarea
            rows={20}
            cols={50}
            value={gridLayout}
            onChange={e => setGridLayout(e.target.value)}
          />
        </div>
      </div>

      <div className="config-buttons">
        <button type="button" onClick={cancelConfig}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            setConfig(configName, {
              ...config,
              gridLayout,
              gridLayoutRows,
              gridLayoutColumns,
            })
          }
        >
          Save changes
        </button>
      </div>
    </div>
  );
};

export const Config = ({
  config,
  setConfig,
  configName,
  cancelConfig,
}: ConfigProps) => {
  const [localConfig, setLocalConfig] = useState(stringifyJSON(config));
  const [isValid, setIsValid] = useState(true);

  if (configName === 'layout') {
    return (
      <LayoutConfig
        config={config as ConfigType}
        setConfig={setConfig}
        configName={configName}
        cancelConfig={cancelConfig}
      />
    );
  }

  return (
    <div className="config-modal">
      <div>Configuring {configName}</div>
      <textarea
        rows={20}
        cols={100}
        value={localConfig}
        onChange={e => {
          const val = e.target.value;
          setLocalConfig(val);
          try {
            parseJSON(val);
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
          onClick={() => setConfig(configName, parseJSON(localConfig))}
          disabled={!isValid}
        >
          Save changes
        </button>
      </div>
    </div>
  );
};
