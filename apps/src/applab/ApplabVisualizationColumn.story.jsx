import PropTypes from 'prop-types';
import React from 'react';
import {ApplabInterfaceMode} from './constants';
import {Provider} from 'react-redux';
import {action} from '@storybook/addon-actions';
import {createStore} from 'redux';
import ApplabVisualizationColumn from './ApplabVisualizationColumn';

export default function(storybook) {
  function StubProvider({state, children}) {
    const store = createStore((s, a) => {
      action(a);
      return s;
    }, state);
    return <Provider store={store}>{children}</Provider>;
  }
  StubProvider.propTypes = {
    state: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
  };

  const pageConstants = {
    channelId: '12345',
    isReadOnlyWorkspace: false,
    visualizationHasPadding: true,
    isShareView: false,
    nonResponsiveVisualizationColumnWidth: 320,
    isIframeEmbed: false,
    hideSource: true,
    playspacePhoneFrame: false,
    pinWorkspaceToBottom: true,
    hasDataMode: false,
    hasDesignMode: false,
    isProjectLevel: false,
    isResponsive: false,
    isSubmittable: false,
    isSubmitted: false,
    widgetMode: false
  };
  const runState = {
    isRunning: false,
    isDebuggerPaused: false,
    awaitingContainedResponse: false
  };
  const layout = {
    visualizationScale: 1
  };
  const globalState = {
    interfaceMode: ApplabInterfaceMode.CODE,
    pageConstants,
    runState,
    layout
  };

  storybook.storiesOf('ApplabVisualizationColumn', module).addStoryTable([
    {
      name: 'default',
      description: 'In the edit view, we do not show the phone frame at all',
      story: () => (
        <StubProvider state={globalState}>
          <ApplabVisualizationColumn
            isEditingProject={false}
            screenIds={[]}
            onScreenCreate={() => undefined}
          />
        </StubProvider>
      )
    },
    {
      name: 'share page',
      description:
        'on the share page, we just start running immediately and do not show any buttons',
      story: () => (
        <StubProvider
          state={{
            ...globalState,
            pageConstants: {
              ...pageConstants,
              isReadOnlyWorkspace: true,
              isShareView: true,
              isIframeEmbed: false
            }
          }}
        >
          <ApplabVisualizationColumn
            isEditingProject={false}
            screenIds={[]}
            onScreenCreate={() => undefined}
          />
        </StubProvider>
      )
    },
    {
      name: 'iframe embed',
      description: 'We show a "Tap or click to run" action and a play button',
      story: () => (
        <StubProvider
          state={{
            ...globalState,
            pageConstants: {
              ...pageConstants,
              isReadOnlyWorkspace: true,
              isShareView: true,
              isIframeEmbed: true
            }
          }}
        >
          <div className="embedded_iframe">
            <ApplabVisualizationColumn
              isEditingProject={false}
              screenIds={[]}
              onScreenCreate={() => undefined}
            />
          </div>
        </StubProvider>
      )
    },
    {
      name: 'iframe embed while running',
      description: 'the play button switches to a reset button',
      story: () => (
        <StubProvider
          state={{
            ...globalState,
            runState: {
              ...runState,
              isRunning: true
            },
            pageConstants: {
              ...pageConstants,
              isReadOnlyWorkspace: true,
              isShareView: true,
              isIframeEmbed: true
            }
          }}
        >
          <div className="embedded_iframe">
            <ApplabVisualizationColumn
              isEditingProject={false}
              screenIds={[]}
              onScreenCreate={() => undefined}
            />
          </div>
        </StubProvider>
      )
    }
  ]);
}
