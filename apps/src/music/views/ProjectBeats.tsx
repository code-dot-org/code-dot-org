import ProjectContainer from '@cdo/apps/lab2/projects/ProjectContainer';
import Lab2Wrapper from '@cdo/apps/lab2/views/Lab2Wrapper';
import {getStore} from '@cdo/apps/redux';
import React from 'react';
import {Provider} from 'react-redux';
import {logError} from '../utils/MusicMetrics';
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
      <Lab2Wrapper
        onError={(error, componentStack) => logError({error, componentStack})}
      >
        <ProjectContainer channelId={channelId}>
          <MusicView inIncubator={true} />
        </ProjectContainer>
      </Lab2Wrapper>
    </Provider>
  );
};

export default ProjectBeats;
