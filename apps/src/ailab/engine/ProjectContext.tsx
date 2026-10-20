import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  applyPresetColumns,
  keepSelectableColumns,
  sortByColumnOrder,
} from './helpers/projectColumns';
import {useAppSelector} from './hooks';
import {getSelectableColumns} from './selectors';
import type {TrainingRun} from './trainers/types';
import {initialProject, type AilabProject} from './types';
import {useResetSignal} from './useResetSignal';

/*
  What will be stored when a training run is applied,
  and what will be restored (from the previous state)
  if the run is cancelled.
*/
type TrainingRunOutputs = Pick<
  AilabProject,
  'hyperparameters' | 'accuracyCheckRowIndices' | 'historicResults'
>;

interface ProjectContextValue {
  project: AilabProject;
  openProject: (saved: AilabProject) => void;
  setLabelColumn: (column?: string) => void;
  addSelectedFeature: (feature: string) => void;
  removeSelectedFeature: (feature: string) => void;
  setSelectedFeatures: (features: string[]) => void;
  applyTrainingRun: (run?: TrainingRun) => void;
  snapshotTrainingRun: () => void;
  restoreTrainingRun: () => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
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
    openWith ?? initialProject
  );
  const previousRun = useRef<TrainingRunOutputs | undefined>(undefined);
  // A project handed to openProject before the dataset was described.
  const pendingProject = useRef<AilabProject | undefined>(undefined);
  const data = useAppSelector(state => state.data);
  const presetColumns = useAppSelector(state => state.presetColumns);
  const selectableColumns = useAppSelector(getSelectableColumns);
  const lockedLabel = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const lockedFeatures = useAppSelector(state => !!state.mode?.lockFeatures);

  useResetSignal(
    useCallback((keepsHistoricResults: boolean) => {
      previousRun.current = undefined;
      // A reset starts the project over, so a project still waiting for the
      // dataset it was saved against no longer applies.
      pendingProject.current = undefined;
      setProject(previous =>
        keepsHistoricResults
          ? {...initialProject, historicResults: previous.historicResults}
          : initialProject
      );
    }, [])
  );

  const setLabelColumn = useCallback((labelColumn?: string) => {
    setProject(previous => ({
      ...previous,
      labelColumn,
      // A column can't be both the thing predicted and a thing predicted from.
      selectedFeatures: previous.selectedFeatures.filter(
        feature => feature !== labelColumn
      ),
    }));
  }, []);

  const addSelectedFeature = useCallback(
    (feature: string) => {
      setProject(previous =>
        feature === previous.labelColumn ||
        previous.selectedFeatures.includes(feature)
          ? previous
          : {
              ...previous,
              selectedFeatures: sortByColumnOrder(
                [...previous.selectedFeatures, feature],
                data
              ),
            }
      );
    },
    [data]
  );

  const removeSelectedFeature = useCallback((feature: string) => {
    setProject(previous => ({
      ...previous,
      selectedFeatures: previous.selectedFeatures.filter(
        selected => selected !== feature
      ),
    }));
  }, []);

  const setSelectedFeatures = useCallback(
    (features: string[]) => {
      setProject(previous => ({
        ...previous,
        selectedFeatures: sortByColumnOrder(
          features.filter(feature => feature !== previous.labelColumn),
          data
        ),
      }));
    },
    [data]
  );

  useEffect(() => {
    if (!presetColumns) {
      return;
    }
    setProject(previous =>
      applyPresetColumns(
        previous,
        presetColumns,
        lockedLabel,
        lockedFeatures,
        data
      )
    );
  }, [presetColumns, lockedLabel, lockedFeatures, data]);

  const applyProject = useCallback(
    (saved: AilabProject) => {
      previousRun.current = undefined;
      const opened = keepSelectableColumns(saved, selectableColumns, data);
      setProject(
        presetColumns
          ? applyPresetColumns(
              opened,
              presetColumns,
              lockedLabel,
              lockedFeatures,
              data
            )
          : opened
      );
    },
    [selectableColumns, data, presetColumns, lockedLabel, lockedFeatures]
  );

  /*
    Opens a saved project, which may name columns this dataset no longer has
    and predates any preset the level applies.

    Waits for the dataset to exist (has at least one selectable column)
    before applying the project.
  */
  const openProject = useCallback(
    (saved: AilabProject) => {
      if (selectableColumns.length === 0) {
        pendingProject.current = saved;
        return;
      }
      pendingProject.current = undefined;
      applyProject(saved);
    },
    [selectableColumns, applyProject]
  );

  useEffect(() => {
    const saved = pendingProject.current;
    if (saved && selectableColumns.length > 0) {
      pendingProject.current = undefined;
      applyProject(saved);
    }
  }, [selectableColumns, applyProject]);

  const applyTrainingRun = useCallback((run?: TrainingRun) => {
    if (!run) {
      return;
    }
    setProject(previous => ({
      ...previous,
      hyperparameters: run.hyperparameters,
      accuracyCheckRowIndices: run.accuracyCheckRowIndices,
      historicResults: [run.historicResult, ...previous.historicResults],
    }));
  }, []);

  const snapshotTrainingRun = useCallback(() => {
    const {hyperparameters, accuracyCheckRowIndices, historicResults} = project;
    previousRun.current = {
      hyperparameters,
      accuracyCheckRowIndices,
      historicResults,
    };
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
      openProject,
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
      openProject,
      setLabelColumn,
      addSelectedFeature,
      removeSelectedFeature,
      setSelectedFeatures,
      applyTrainingRun,
      snapshotTrainingRun,
      restoreTrainingRun,
    ]
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
