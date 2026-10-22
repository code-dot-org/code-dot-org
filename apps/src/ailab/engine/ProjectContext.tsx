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
  /*
    Whether a project has been opened yet. Until it has, the project is the
    lab's own empty one rather than the student's, and saving it over theirs
    would lose their work. A reset empties the project but does not unset
    this: an emptied project is still the state they are now in.
  */
  opened: boolean;
  /** A project has been handed over and is waiting for its dataset. */
  opening: boolean;
  /*
    The project is the lab's own empty one: nothing has been opened or chosen
    yet, or a reset has just emptied it. Saving it would be saving the absence
    of the student's work rather than their work.
  */
  empty: boolean;
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
  const [opened, setOpened] = useState(false);
  const previousRun = useRef<TrainingRunOutputs | undefined>(undefined);
  /*
    A project waiting for the dataset it will be reconciled against. Opening
    one always waits a render, so the dataset it meets is the one the lab has
    then, not the one it had when the project arrived.
  */
  const [pendingProject, setPendingProject] = useState<
    AilabProject | undefined
  >();
  const opening = pendingProject !== undefined;
  /*
    Identity, not contents: a reset puts this exact project back, while
    opening one or choosing a column always builds a new one.
  */
  const empty = project === initialProject;
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
    useCallback(() => {
      previousRun.current = undefined;
      /*
        A project waiting for its dataset outlives a reset. The level load
        that opens a project resets the lab first, and the student choosing a
        dataset may be choosing the one that project was saved against.
      */
      setProject(initialProject);
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
      const reconciled = keepSelectableColumns(saved, selectableColumns, data);
      setProject(
        presetColumns
          ? applyPresetColumns(
              reconciled,
              presetColumns,
              lockedLabel,
              lockedFeatures,
              data
            )
          : reconciled
      );
      setOpened(true);
    },
    [selectableColumns, data, presetColumns, lockedLabel, lockedFeatures]
  );

  /*
    Opens a saved project, which may name columns this dataset no longer has
    and predates any preset the level applies.

    Waits for the dataset to be described before applying the project.
  */
  const openProject = useCallback((saved: AilabProject) => {
    setPendingProject(saved);
  }, []);

  useEffect(() => {
    if (pendingProject && datasetDescribed) {
      setPendingProject(undefined);
      applyProject(pendingProject);
    }
  }, [pendingProject, datasetDescribed, applyProject]);

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
      opened,
      opening,
      empty,
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
      opened,
      opening,
      empty,
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
