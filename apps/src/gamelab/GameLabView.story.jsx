import React from 'react';
import {Provider} from 'react-redux';
import {GameLabView} from './GameLabView';
import {GameLabInterfaceMode} from './constants';
import {getStore, registerReducers} from '../redux';
import * as commonReducers from '../redux/commonReducers';
import {setPageConstants} from '../redux/pageConstants';
import gamelabReducers from './reducers';

registerReducers(commonReducers);
registerReducers(gamelabReducers);

import '../../style/common.scss';
import '../../style/gamelab/style.scss';

export default function (storybook) {
  storybook
    .storiesOf('GameLabView', module)
    .addStoryTable([
      {
        name: 'game lab view',
        description: 'in all its glory',
        story: () => {
          getStore().dispatch(
            setPageConstants({
              isEmbedView: true,
              isShareView: false,
              hideSource: true,
              isIframeEmbed: false,
              pinWorkspaceToBottom: false,
              noVisualization: false,
              localeDirection: 'ltr',
              isDroplet: false,
              isReadOnlyWorkspace: true,
            })
          );
          return (
            <Provider store={getStore()}>
              <GameLabView
                showFinishButton={false}
                onMount={()=>{}}

                hideSource={true}
                interfaceMode={GameLabInterfaceMode.CODE}
                isResponsive={false}
                pinWorkspaceToBottom={false}
                allowAnimationMode={true}
                showVisualizationHeader={false}
                isIframeEmbed={false}
                isRunning={false}
              />
            </Provider>
          );
        },
      }
    ]);
}
