import {LabState} from '@cdo/apps/lab2/lab2Redux';
import ProjectContainer from '@cdo/apps/lab2/projects/ProjectContainer';
import DialogManager from '@cdo/apps/lab2/views/dialogs/DialogManager';
import Lab2Wrapper from '@cdo/apps/lab2/views/Lab2Wrapper';
import MetricsAdapter from '@cdo/apps/lab2/views/MetricsAdapter';
import {getStore} from '@cdo/apps/redux';
import React from 'react';
import {Provider, useSelector} from 'react-redux';
import MusicView from './MusicView';

/**
 * Renders the "Project Beats" Music Lab experience, presented only on the Incubator page.
 * All other Music Lab experiences (script levels, single levels, standalone projects)
 * are presented via the Lab2 entrypoint.
 */
const ProjectBeats: React.FunctionComponent<{channelId: string}> = ({
  channelId,
}) => {
  return (
    <Provider store={getStore()}>
      <Lab2Wrapper>
        <DialogManager>
          <MetricsAdapter />
          <ProjectContainer channelId={channelId} appName={'music'}>
            <DeferredMusicView />
          </ProjectContainer>
        </DialogManager>
      </Lab2Wrapper>
    </Provider>
  );
};

export default ProjectBeats;

// Defers loading MusicView until the channel has been loaded. This ensures
// that all project data has been loaded before mounting MusicView.
const DeferredMusicView: React.FunctionComponent = () => {
  const channelLoaded = useSelector(
    (state: {lab: LabState}) => !!state.lab.channel
  );

  if (!channelLoaded) {
    return null;
  }

  return <MusicView inIncubator={true} />;
};
