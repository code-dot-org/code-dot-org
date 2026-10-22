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
  onEdited?: (project: AilabProject) => void;
}

export const ProjectProvider = ({
  children,
  project: openWith,
  onEdited,
}: ProjectProviderProps) => {
  const [project, setProject] = useState<AilabProject>(
    openWith ?? initialProject
  );
  // Track the latest project as a ref to ensure we always have the most recent state.
  const latestProject = useRef(project);
  latestProject.current = project;
  const onEditedRef = useRef(onEdited);
  onEditedRef.current = onEdited;

  /*
    Applies a change the student made, and reports it. Everything that writes
    the project on their behalf goes through setProject directly instead.
  */
  const edit = useCallback(
    (update: (previous: AilabProject) => AilabProject) => {
      const next = update(latestProject.current);
      latestProject.current = next;
      setProject(next);
      onEditedRef.current?.(next);
    },
    []
  );
  const previousRun = useRef<TrainingRunOutputs | undefined>(undefined);
  // A project handed to openProject before the dataset was described.
  const pendingProject = useRef<AilabProject | undefined>(undefined);
  const data = useAppSelector(state => state.data);
  const presetColumns = useAppSelector(state => state.presetColumns);
  const selectableColumns = useAppSelector(getSelectableColumns);
  const lockedLabel = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const lockedFeatures = useAppSelector(state => !!state.mode?.lockFeatures);
  // The rows and the column types arrive separately, and a dataset is only
  // described once both have.
  const columnTypesKnown = useAppSelector(
    state => Object.keys(state.columnsByDataType).length > 0
  );
  const datasetDescribed = data.length > 0 && columnTypesKnown;

  useResetSignal(
    useCallback((keepsPendingProject: boolean) => {
      previousRun.current = undefined;
      if (!keepsPendingProject) {
        pendingProject.current = undefined;
      }
      setProject(initialProject);
    }, [])
  );

  const setLabelColumn = useCallback(
    (labelColumn?: string) => {
      edit(previous => ({
        ...previous,
        labelColumn,
        // A column can't be both the thing predicted and a thing predicted from.
        selectedFeatures: previous.selectedFeatures.filter(
          feature => feature !== labelColumn
        ),
      }));
    },
    [edit]
  );

  const addSelectedFeature = useCallback(
    (feature: string) => {
      edit(previous =>
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
    [data, edit]
  );

  const removeSelectedFeature = useCallback(
    (feature: string) => {
      edit(previous => ({
        ...previous,
        selectedFeatures: previous.selectedFeatures.filter(
          selected => selected !== feature
        ),
      }));
    },
    [edit]
  );

  const setSelectedFeatures = useCallback(
    (features: string[]) => {
      edit(previous => ({
        ...previous,
        selectedFeatures: sortByColumnOrder(
          features.filter(feature => feature !== previous.labelColumn),
          data
        ),
      }));
    },
    [data, edit]
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

    Waits for the dataset to be described before applying the project.
  */
  const openProject = useCallback(
    (saved: AilabProject) => {
      if (!datasetDescribed) {
        pendingProject.current = saved;
        return;
      }
      pendingProject.current = undefined;
      applyProject(saved);
    },
    [datasetDescribed, applyProject]
  );

  useEffect(() => {
    const saved = pendingProject.current;
    if (saved && datasetDescribed) {
      pendingProject.current = undefined;
      applyProject(saved);
    }
  }, [datasetDescribed, applyProject]);

  const applyTrainingRun = useCallback(
    (run?: TrainingRun) => {
      if (!run) {
        return;
      }
      edit(previous => ({
        ...previous,
        hyperparameters: run.hyperparameters,
        accuracyCheckRowIndices: run.accuracyCheckRowIndices,
        historicResults: [run.historicResult, ...previous.historicResults],
      }));
    },
    [edit]
  );

  const snapshotTrainingRun = useCallback(() => {
    const {hyperparameters, accuracyCheckRowIndices, historicResults} = project;
    previousRun.current = {
      hyperparameters,
      accuracyCheckRowIndices,
      historicResults,
    };
  }, [project]);

  // Cancelling a run is as much a change to save as making one.
  const restoreTrainingRun = useCallback(() => {
    const previousOutputs = previousRun.current;
    if (previousOutputs) {
      edit(previous => ({...previous, ...previousOutputs}));
    }
  }, [edit]);

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
