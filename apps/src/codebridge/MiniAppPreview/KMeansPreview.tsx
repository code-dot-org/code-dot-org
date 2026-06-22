import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import React, {useMemo, useState} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import KMeans from '@cdo/apps/miniApps/kmeans/KMeans';
import KMeansVisualization from '@cdo/apps/miniApps/kmeans/KMeansVisualization';
import {KMeansVisualizationState} from '@cdo/apps/miniApps/kmeans/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

const defaultState: KMeansVisualizationState = {
  points: [],
  centroids: [],
  assignments: new Map(),
  converged: false,
  iteration: 0,
  isReady: false,
  isAnimating: false,
};

const KMeansPreview: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<KMeansVisualizationState>(defaultState);

  const kmeans = useMemo(() => {
    const instance = new KMeans({
      setIsRunning: isRunning => dispatch(setIsRunning(isRunning)),
      onAddPoint: point =>
        setState(prev => ({...prev, points: [...prev.points, point]})),
      onReady: () => setState(prev => ({...prev, isReady: true})),
      onReset: () => setState(defaultState),
      onCentroidsInitialized: centroids =>
        setState(prev => ({...prev, centroids, iteration: 0})),
      onAssigned: assignments =>
        setState(prev => ({
          ...prev,
          assignments: new Map(assignments),
          iteration:
            assignments.length > 0 ? prev.iteration + 1 : prev.iteration,
        })),
      onCentroidsUpdated: centroids => setState(prev => ({...prev, centroids})),
      onConverged: () =>
        setState(prev => ({...prev, converged: true, isAnimating: false})),
      onAnimationStart: () => setState(prev => ({...prev, isAnimating: true})),
      onAnimationEnd: () => setState(prev => ({...prev, isAnimating: false})),
    });
    CodebridgeRegistry.getInstance().setKMeans(instance);
    return instance;
  }, [dispatch]);

  return (
    <KMeansVisualization
      state={state}
      onInitialize={() => kmeans.initialize()}
      onStep={() => kmeans.step()}
      onPlay={() => kmeans.play()}
    />
  );
};

export default KMeansPreview;
