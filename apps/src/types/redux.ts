import {AichatState} from '@cdo/apps/aichat/redux/aichatRedux';
import {AITutorState} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {HeaderReduxState} from '@cdo/apps/code-studio/headerRedux';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {JavalabConsoleState} from '@cdo/apps/javalab/redux/consoleRedux';
import {JavalabEditorState} from '@cdo/apps/javalab/redux/editorRedux';
import {JavalabState} from '@cdo/apps/javalab/redux/javalabRedux';
import {JavalabViewState} from '@cdo/apps/javalab/redux/viewRedux';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {MazeState} from '@cdo/apps/maze/redux';
import {MusicState} from '@cdo/apps/music/redux/musicRedux';
import {PythonlabState} from '@cdo/apps/pythonlab/pythonlabRedux';
import {LayoutState} from '@cdo/apps/redux/layout';
import {LocaleState} from '@cdo/apps/redux/localesRedux';
import {MapboxState} from '@cdo/apps/redux/mapbox';
import {CurrentUserState} from '@cdo/apps/templates/CurrentUserState';

import {Lab2ProjectState} from '../lab2/redux/lab2ProjectRedux';
import {BlocklyState} from '../redux/blockly';

// The type for our global redux store. This is incomplete until we type every slice
// of our redux store. When converting a slice to typescript, add it to this object
// in order to make using the slice easier in components.
// We cannot infer the type of our store because we programmatically add to the store
// with registerReducers.
export interface RootState {
  aiTutor: AITutorState;
  aichat: AichatState;
  blockly: BlocklyState;
  currentUser: CurrentUserState;
  header: HeaderReduxState;
  javalab: JavalabState;
  javalabConsole: JavalabConsoleState;
  javalabEditor: JavalabEditorState;
  javalabView: JavalabViewState;
  lab: LabState;
  lab2Project: Lab2ProjectState;
  layout: LayoutState;
  locales: LocaleState;
  mapbox: MapboxState;
  maze: MazeState;
  music: MusicState;
  progress: ProgressState;
  pythonlab: PythonlabState;
}
