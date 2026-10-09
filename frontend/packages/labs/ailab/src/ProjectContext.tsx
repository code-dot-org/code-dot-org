/*
  The project: everything saved with a student's work and restored when the
  level loads again. The dataset is re-fetched on load and the model is refit,
  so neither belongs here — only the choices and results that exist nowhere
  else.
*/

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
import type {Hyperparameters, HistoricResult} from './types';

export interface AilabProject {
  hyperparameters?: Hyperparameters;
  historicResults: HistoricResult[];
}

// What a training run owns, and so what cancelling one puts back. The rest of
// the project survives a cancelled run untouched.
type TrainingRunOutputs = Pick<
  AilabProject,
  'hyperparameters' | 'historicResults'
>;

export interface ProjectContextValue {
  project: AilabProject;
  applyTrainingRun: (run?: TrainingRun) => void;
  snapshotTrainingRun: () => void;
  restoreTrainingRun: () => void;
}

export const initialProject: AilabProject = {
  hyperparameters: undefined,
  historicResults: [],
};

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined,
);

interface ProjectProviderProps {
  children: ReactNode;
  // The project to open with. A level load will pass a saved one here.
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
  const resetCount = useAppSelector(state => state.resetCount);
  const keepsHistoricResults = useAppSelector(
    state => state.resetKeepsHistoricResults,
  );
  const appliedReset = useRef(resetCount);

  // A reset is dispatched outside React — by loadLevel(), by startOver(), or
  // by choosing or uploading a dataset — so it can't clear the project itself.
  useEffect(() => {
    if (appliedReset.current === resetCount) {
      return;
    }
    appliedReset.current = resetCount;
    previousRun.current = undefined;
    setProject(previous =>
      keepsHistoricResults
        ? {...initialProject, historicResults: previous.historicResults}
        : initialProject,
    );
  }, [resetCount, keepsHistoricResults]);

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
      applyTrainingRun,
      snapshotTrainingRun,
      restoreTrainingRun,
    }),
    [project, applyTrainingRun, snapshotTrainingRun, restoreTrainingRun],
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
