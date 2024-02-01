import {JavalabConsoleState} from '@cdo/apps/javalab/redux/consoleRedux';
import {JavalabEditorState} from '@cdo/apps/javalab/redux/editorRedux';
import {JavalabState} from '@cdo/apps/javalab/redux/javalabRedux';
import {JavalabViewState} from '@cdo/apps/javalab/redux/viewRedux';
import {LayoutState} from '@cdo/apps/redux/layout';
import {LocaleState} from '@cdo/apps/redux/localesRedux';
import {MapboxState} from '@cdo/apps/redux/mapbox';
import {MazeState} from '@cdo/apps/maze/redux';
import {MusicState} from '@cdo/apps/music/redux/musicRedux';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {HeaderReduxState} from '@cdo/apps/code-studio/headerRedux';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {PythonlabState} from '@cdo/apps/pythonlab/pythonlabRedux';
import {AITutorState} from '@cdo/apps/aiTutor/redux/aiTutorRedux';

// The type for our global redux store. This is incomplete until we type every slice
// of our redux store. When converting a slice to typescript, add it to this object
// in order to make using the slice easier in components.
// We cannot infer the type of our store because we programmatically add to the store
// with registerReducers.
export interface ReduxStore {
  aiTutor: AITutorState;
  header: HeaderReduxState;
  javalab: JavalabState;
  javalabConsole: JavalabConsoleState;
  javalabEditor: JavalabEditorState;
  javalabView: JavalabViewState;
  lab: LabState;
  layout: LayoutState;
  locales: LocaleState;
  mapbox: MapboxState;
  maze: MazeState;
  music: MusicState;
  progress: ProgressState;
  pythonlab: PythonlabState;
}
