import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {TrainingRun} from './trainers/types';
import {initialProject, type AilabProject} from './types';
import {useResetSignal} from './useResetSignal';

interface ProjectContextValue {
  project: AilabProject;
  applyTrainingRun: (run?: TrainingRun) => void;
  snapshotTrainingRun: () => void;
  restoreTrainingRun: () => void;
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
  // What a training run owns, and so what cancelling one puts back.
  const previousRun = useRef<AilabProject | undefined>(undefined);

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
