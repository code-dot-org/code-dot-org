import type {FunctionComponent} from 'react';
import {useEffect} from 'react';

import useLifecycleNotifier from '../hooks/useLifecycleNotifier';
import LabRegistry from '../LabRegistry';
import {Callback, LifecycleEvent} from '../LifecycleNotifier';
import {useAppSelector} from '../redux/store';

/**
 * Listens for Redux state changes and updates the LabMetricsReporter accordingly.
 * Reports errors whenever the pageError state is updated, and reports a LevelLoad
 * metric when a new level is loaded.
 */
const MetricsAdapter: FunctionComponent = () => {
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const currentLevelId = useAppSelector(
    state => state.progress.currentLevelId || undefined,
  );
  const scriptId = useAppSelector(
    state => state.progress.scriptId || undefined,
  );
  const pageError = useAppSelector(state => state.lab.pageError);

  const isShareView = useAppSelector(state => state.lab.isShareView);

  useEffect(() => {
    // Reset the reporter on level change.
    const reporter = LabRegistry.metricsReporter;
    reporter.reset();
    reporter.updateProperties({currentLevelId});
  }, [currentLevelId]);

  useEffect(() => {
    LabRegistry.metricsReporter.updateProperties({scriptId});
  }, [scriptId]);

  useEffect(() => {
    LabRegistry.metricsReporter.updateProperties({channelId});
  }, [channelId]);

  useEffect(() => {
    LabRegistry.metricsReporter.updateProperties({appName});
  }, [appName]);

  useEffect(() => {
    if (pageError) {
      LabRegistry.metricsReporter.logError(
        pageError.errorMessage,
        pageError.error,
        pageError.details,
      );
    }
  }, [pageError]);

  // Log a LevelLoad metric when a level is loaded.
  const logLoadMetric: Callback<LifecycleEvent.LevelLoadCompleted> = (
    levelProperties,
    _channel,
    _initialSources,
    isReadOnly,
  ) => {
    LabRegistry.metricsReporter.incrementCounter('LevelLoad', [
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
