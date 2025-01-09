import React, {useEffect} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {Callback, LifecycleEvent} from '@cdo/apps/lab2/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Listens for Redux state changes and updates the Lab2MetricsReporter accordingly.
 * Reports errors whenever the pageError state is updated, and reports a LevelLoad
 * metric when a new level is loaded.
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

  // Log a LevelLoad metric when a level is loaded.
  const logLoadMetric: Callback<LifecycleEvent.LevelLoadCompleted> = (
    levelProperties,
    _channel,
    _initialSources,
    isReadOnly
  ) => {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('LevelLoad', [
        {
          name: 'Type',
          value: levelProperties?.isProjectLevel ? 'Project' : 'Level',
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
