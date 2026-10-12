import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {useAppSelector} from './hooks';
import type {TrainingRun} from './trainers/types';
import {initialProject, type AilabProject, type DataRow} from './types';
import {useResetSignal} from './useResetSignal';

/*
  What will be stored when a training run is applied,
  and what will be restored (from the previous state)
  if the run is cancelled.
*/
type TrainingRunOutputs = Pick<
  AilabProject,
  'hyperparameters' | 'historicResults'
>;

interface ProjectContextValue {
  project: AilabProject;
  setLabelColumn: (column?: string) => void;
  addSelectedFeature: (feature: string) => void;
  removeSelectedFeature: (feature: string) => void;
  setSelectedFeatures: (features: string[]) => void;
  applyTrainingRun: (run?: TrainingRun) => void;
  snapshotTrainingRun: () => void;
  restoreTrainingRun: () => void;
}

function sortByColumnOrder(features: string[], data: DataRow[]): string[] {
  const columns = Object.keys(data[0] ?? {});
  return [...features].sort((a, b) => columns.indexOf(a) - columns.indexOf(b));
}

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined,
);

interface ProjectProviderProps {
  children: ReactNode;
  project?: AilabProject;
}

export const ProjectProvider = ({
  children,
  project: openWith,
}: ProjectProviderProps) => {
  const [project, setProject] = useState<AilabProject>(
    openWith ?? initialProject,
  );
  const previousRun = useRef<TrainingRunOutputs | undefined>(undefined);
  const data = useAppSelector(state => state.data);
  const presetLabelColumn = useAppSelector(state =>
    state.mode?.hideSelectLabel ? state.metadata.defaultLabelColumn : undefined,
  );

  useResetSignal(
    useCallback((keepsHistoricResults: boolean) => {
      previousRun.current = undefined;
      setProject(previous =>
        keepsHistoricResults
          ? {...initialProject, historicResults: previous.historicResults}
          : initialProject,
      );
    }, []),
  );

  const setLabelColumn = useCallback((labelColumn?: string) => {
    setProject(previous => ({
      ...previous,
      labelColumn,
      // A column can't be both the thing predicted and a thing predicted from.
      selectedFeatures: previous.selectedFeatures.filter(
        feature => feature !== labelColumn,
      ),
    }));
  }, []);

  useEffect(() => {
    if (presetLabelColumn) {
      setLabelColumn(presetLabelColumn);
    }
  }, [presetLabelColumn, setLabelColumn]);

  const addSelectedFeature = useCallback(
    (feature: string) => {
      setProject(previous =>
        previous.selectedFeatures.includes(feature)
          ? previous
          : {
              ...previous,
              selectedFeatures: sortByColumnOrder(
                [...previous.selectedFeatures, feature],
                data,
              ),
            },
      );
    },
    [data],
  );

  const removeSelectedFeature = useCallback((feature: string) => {
    setProject(previous => ({
      ...previous,
      selectedFeatures: previous.selectedFeatures.filter(
        selected => selected !== feature,
      ),
    }));
  }, []);

  const setSelectedFeatures = useCallback(
    (features: string[]) => {
      setProject(previous => ({
        ...previous,
        selectedFeatures: sortByColumnOrder(features, data),
      }));
    },
    [data],
  );

  const applyTrainingRun = useCallback((run?: TrainingRun) => {
    if (!run) {
      return;
    }
    setProject(previous => ({
      ...previous,
      hyperparameters: run.hyperparameters,
      historicResults: [run.historicResult, ...previous.historicResults],
    }));
  }, []);

  const snapshotTrainingRun = useCallback(() => {
    const {hyperparameters, historicResults} = project;
    previousRun.current = {hyperparameters, historicResults};
  }, [project]);

  const restoreTrainingRun = useCallback(() => {
    const previousOutputs = previousRun.current;
    if (previousOutputs) {
      setProject(previous => ({...previous, ...previousOutputs}));
    }
  }, []);

  const value = useMemo(
    () => ({
      project,
      setLabelColumn,
      addSelectedFeature,
      removeSelectedFeature,
      setSelectedFeatures,
      applyTrainingRun,
      snapshotTrainingRun,
      restoreTrainingRun,
    }),
    [
      project,
      setLabelColumn,
      addSelectedFeature,
      removeSelectedFeature,
      setSelectedFeatures,
      applyTrainingRun,
      snapshotTrainingRun,
      restoreTrainingRun,
    ],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export function useProject(): ProjectContextValue {
  const value = useContext(ProjectContext);
  if (!value) {
    throw new Error('useProject requires a ProjectProvider');
  }
  return value;
}
