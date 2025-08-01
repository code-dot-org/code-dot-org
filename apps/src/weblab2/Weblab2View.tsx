import {Codebridge} from '@codebridge/Codebridge';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {css} from '@codemirror/lang-css';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {LanguageSupport} from '@codemirror/language';
import React, {useState} from 'react';

import {LabProps, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';

import {useSource} from '../codebridge/hooks/useSource';
import {useAppSelector} from '../util/reduxHooks';

import HorizontalLayout from './layout/HorizontalLayout';
import VerticalLayout from './layout/VerticalLayout';

import moduleStyles from './styles/weblab2-view.module.scss';

const weblabLangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
  js: javascript(),
};

const defaultConfig: ConfigType = {
  languageMapping: weblabLangMapping,
  editableFileTypes: ['html', 'css', 'js'],
  activeLayout: 'vertical',
  layoutComponents: {
    vertical: VerticalLayout,
    horizontal: HorizontalLayout,
  },
};

const defaultSource: MultiFileSource = {
  folders: {},
  files: {
    '1': {
      id: '1',
      name: 'index.html',
      language: 'html',
      contents: `<!DOCTYPE html>
<html>
  <body>
    Content goes here!
  </body>
</html>
  `,
      active: true,
      folderId: '0',
    },
  },
  openFiles: ['1'],
};

const defaultProject: ProjectSources = {source: defaultSource};

const Weblab2View: React.FC<
  LabProps<CodebridgeLevelProperties, ProjectSources>
> = ({levelProperties, initialSources}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {startSources} = useSource(
    defaultProject,
    levelProperties,
    initialSources
  );

  const hasSource = useAppSelector(
    state => !!state.lab2Project.projectSources?.source
  );

  return (
    <div className={moduleStyles.weblab2Container}>
      {hasSource && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={startSources}
          levelProperties={levelProperties}
        />
      )}
    </div>
  );
};

export default Weblab2View;
