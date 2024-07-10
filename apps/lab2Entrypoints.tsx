// Define the set of entrypoints for Lab2-based labs
//
// Want to add a new lab?
// - This is one of the main files you'll have to edit
// - Here's an example PR: https://github.com/code-dot-org/code-dot-org/pull/55952/files
// - Read the Lab2 Architecture doc: https://docs.google.com/document/d/1a8fPxd4mvV7LdhxGOCuCzTs4cmNt0o18CwpcH2KeGBU/edit#heading=h.td4mrmujd2i9
// - Please use lazy-loading

import React, {ComponentType, LazyExoticComponent, lazy} from 'react';

import AichatView from '@cdo/apps/aichat/views/AichatView';
import DanceView from '@cdo/apps/dance/lab2/views/DanceView';
import {Theme} from '@cdo/apps/lab2/views/ThemeWrapper';
import {setUpBlocklyForMusicLab} from '@cdo/apps/music/blockly/setup';
import MusicView from '@cdo/apps/music/views/MusicView';
import PanelsLabView from '@cdo/apps/panels/PanelsLabView';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';
import Weblab2View from '@cdo/apps/weblab2/Weblab2View';

// export type AppName =
//   | 'aichat'
//   | 'applab'
//   | 'calc'
//   | 'dance'
//   | 'eval'
//   | 'flappy'
//   | 'gamelab'
//   | 'javalab'
//   | 'music'
//   | 'thebadguys'
//   | 'weblab'
//   | 'turtle'
//   | 'craft'
//   | 'studio'
//   | 'bounce'
//   | 'poetry'
//   | 'pythonlab'
//   | 'spritelab'
//   | 'standalone_video'
//   | 'panels'
//   | 'weblab2';

// Configuration for how a Lab should be rendered
export interface AppProperties {
  /**
   * Whether this lab should remain rendered in the background once mounted.
   * If true, the lab will always be present in the tree, but will be hidden
   * via visibility: hidden when not active. If false, the lab will only
   * be rendered in the tree when active.
   */
  backgroundMode: boolean;
  /** React View for the Lab */
  node: React.ReactNode;
  /**
   * A lazy loaded view for the lab. If this is specified, it will be used
   * over the node property. This is useful for lab views that load extra
   * dependencies that we don't want loaded for every lab.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyNode?: LazyExoticComponent<ComponentType<any>>;
  /**
   * Display theme for this lab. This will likely be configured by user
   * preferences eventually, but for now this is fixed for each lab. Defaults
   * to the default theme if not specified.
   */
  theme?: Theme;
  /**
   * Optional function to run when the lab is first mounted. This is useful
   * for any one-time setup actions such as setting up Blockly.
   */
  setupFunction?: () => void;
}

export const lab2Entrypoints: Record<string, AppProperties> = {
  music: {
    backgroundMode: true,
    node: <MusicView />,
    theme: Theme.DARK,
    setupFunction: setUpBlocklyForMusicLab,
  },
  standalone_video: {
    backgroundMode: false,
    node: <StandaloneVideo />,
  },
  aichat: {
    backgroundMode: false,
    node: <AichatView />,
    theme: Theme.LIGHT,
  },
  dance: {
    backgroundMode: false,
    node: <DanceView />,
    theme: Theme.LIGHT,
  },
  pythonlab: {
    backgroundMode: false,
    node: <div />,
    lazyNode: lazy(() =>
      import(
        /* webpackChunkName: "pythonlab" */ './src/pythonlab/index.js'
      ).then(({PythonlabView}) => ({
        default: PythonlabView,
      }))
    ),
    theme: Theme.DARK,
  },
  panels: {
    backgroundMode: false,
    node: <PanelsLabView />,
  },
  weblab2: {
    backgroundMode: false,
    node: <Weblab2View />,
    theme: Theme.DARK,
  },
};

export type AppName = keyof typeof lab2Entrypoints;
