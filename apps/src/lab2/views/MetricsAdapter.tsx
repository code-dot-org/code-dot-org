import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {ProgressState} from '@cdo/apps/code-studio/progressRedux';

import {LabState} from '../lab2Redux';
import Lab2Registry from '../Lab2Registry';

/**
 * Listens for Redux state changes and updates the Lab2MetricsReporter accordingly.
 * Reports errors whenever the pageError state is updated.
 */
const MetricsAdapter: React.FunctionComponent = () => {
  const channelId = useSelector(
    (state: {lab: LabState}) => state.lab.channel?.id
  );
  const appName = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.appName
  );
  const currentLevelId = useSelector(
    (state: {progress: ProgressState}) =>
      state.progress.currentLevelId || undefined
  );
  const scriptId = useSelector(
    (state: {progress: ProgressState}) => state.progress.scriptId || undefined
  );
  const pageError = useSelector(
    (state: {lab: LabState}) => state.lab.pageError
  );

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

  return null;
};

export default MetricsAdapter;
