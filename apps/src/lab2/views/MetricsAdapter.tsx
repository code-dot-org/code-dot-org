import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import Lab2MetricsReporter from '../Lab2MetricsReporter';
import {LabState} from '../lab2Redux';

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
    Lab2MetricsReporter.reset();
    Lab2MetricsReporter.updateProperties({currentLevelId});
  }, [currentLevelId]);

  useEffect(() => {
    Lab2MetricsReporter.updateProperties({scriptId});
  }, [scriptId]);

  useEffect(() => {
    Lab2MetricsReporter.updateProperties({channelId});
  }, [channelId]);

  useEffect(() => {
    Lab2MetricsReporter.updateProperties({appName});
  }, [appName]);

  useEffect(() => {
    if (pageError) {
      Lab2MetricsReporter.logError(
        pageError.errorMessage,
        pageError.error,
        pageError.details
      );
    }
  }, [pageError]);

  return null;
};

export default MetricsAdapter;
