import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import ApplabVisualizationColumn from './ApplabVisualizationColumn';

export default function (storybook) {

  function StubProvider({state, children}) {
    const store = createStore(
      (s, a) => {
        storybook.action(a);
        return s;
      },
      state
    );
    return <Provider store={store}>{children}</Provider>;
  }
  StubProvider.propTypes = {
    state: React.PropTypes.object.isRequired,
    children: React.PropTypes.node.isRequired,
  };

  const pageConstants = {
    isReadOnlyWorkspace: false,
    visualizationHasPadding: true,
    isShareView: false,
    nonResponsiveVisualizationColumnWidth: 320,
    isIframeEmbed: false,
    hideSource: true,
    playspacePhoneFrame: false,
    pinWorkspaceToBottom: true,
    isProjectLevel: false,
    isSubmittable: false,
    isSubmitted: false,
  };
  const runState = {
    isRunning: false,
    isDebuggerPaused: false,
    awaitingContainedResponse: false,
  };

  storybook
    .storiesOf('ApplabVisualizationColumn', module)
    .addStoryTable([
      {
        name: 'default',
        description: 'In the edit view, we do not show the phone frame at all',
        story: () => (
          <StubProvider
            state={{
              runState,
              pageConstants
            }}
          >
            <ApplabVisualizationColumn
              isEditingProject={false}
              screenIds={[]}
              onScreenCreate={()=>undefined}
            />
          </StubProvider>
        ),
      },
      {
        name: 'share page',
        description: 'on the share page, we just start running immediately and do not show any buttons',
        story: () => (
          <StubProvider
            state={{
              runState,
              pageConstants: {
                ...pageConstants,
                isReadOnlyWorkspace: true,
                isShareView: true,
                isIframeEmbed: false,
              }
            }}
          >
            <ApplabVisualizationColumn
              isEditingProject={false}
              screenIds={[]}
              onScreenCreate={()=>undefined}
            />
          </StubProvider>
        ),
      },
      {
        name: 'iframe embed',
        description: 'We show a "Tap or click to run" action and a play button',
        story: () => (
          <StubProvider
            state={{
              runState,
              pageConstants: {
                ...pageConstants,
                isReadOnlyWorkspace: true,
                isShareView: true,
                isIframeEmbed: true,
              }
            }}
          >
          <div className="embedded_iframe">
            <ApplabVisualizationColumn
              isEditingProject={false}
              screenIds={[]}
              onScreenCreate={()=>undefined}
            />
          </div>
          </StubProvider>
        ),
      },
      {
        name: 'iframe embed while running',
        description: 'the play button switches to a reset button',
        story: () => (
          <StubProvider
            state={{
              runState: {
                ...runState,
                isRunning: true,
              },
              pageConstants: {
                ...pageConstants,
                isReadOnlyWorkspace: true,
                isShareView: true,
                isIframeEmbed: true,
              }
            }}
          >
          <div className="embedded_iframe">
            <ApplabVisualizationColumn
              isEditingProject={false}
              screenIds={[]}
              onScreenCreate={()=>undefined}
            />
          </div>
          </StubProvider>
        ),
      },
    ]);
}
