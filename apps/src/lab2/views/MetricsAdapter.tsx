import React, {useEffect} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LifecycleEvent} from '@cdo/apps/lab2/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Listens for Redux state changes and updates the Lab2MetricsReporter accordingly.
 * Reports errors whenever the pageError state is updated.
 */
const MetricsAdapter: React.FunctionComponent = () => {
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const currentLevelId = useAppSelector(
    state => state.progress.currentLevelId || undefined
  );
  const scriptId = useAppSelector(
    state => state.progress.scriptId || undefined
  );
  const pageError = useAppSelector(state => state.lab.pageError);

  const isProjectLevel = useAppSelector(
    state => state.lab.levelProperties?.isProjectLevel
  );
  const isReadOnly = useAppSelector(state => isReadOnlyWorkspace(state));
  const isShareView = useAppSelector(state => state.lab.isShareView);

  useEffect(() => {
    // Reset the reporter on level change.
    const reporter = Lab2Registry.getInstance().getMetricsReporter();
    reporter.reset();
    reporter.updateProperties({currentLevelId});
  }, [currentLevelId]);

  useEffect(() => {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .updateProperties({scriptId});
  }, [scriptId]);

  useEffect(() => {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .updateProperties({channelId});
  }, [channelId]);

  useEffect(() => {
    Lab2Registry.getInstance().getMetricsReporter().updateProperties({appName});
  }, [appName]);

  useEffect(() => {
    if (pageError) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(pageError.errorMessage, pageError.error, pageError.details);
    }
  }, [pageError]);

  const logLoadMetric = () => {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('LevelLoad', [
        {
          name: 'Type',
          value: isProjectLevel ? 'Project' : 'Level',
        },
        {
          name: 'Mode',
          value: isShareView ? 'Share' : isReadOnly ? 'View' : 'Edit',
        },
      ]);
  };

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, logLoadMetric);

  return null;
};

export default MetricsAdapter;
