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
import {defaultProject, type AilabProject} from './types';
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
  isProjectLoaded: boolean;
  /** A project has been handed over and is waiting for its dataset. */
  isProjectLoading: boolean;
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
  /*
    A saved project to open the lab with, once its dataset has loaded. Opening
    starts again whenever this changes, so it must hold still while the student
    works.
  */
  initialProject?: AilabProject;
  /** Called with the project whenever the student changes it. */
  onProjectChange?: (project: AilabProject) => void;
}

export const ProjectProvider = ({
  children,
  initialProject,
  onProjectChange,
}: ProjectProviderProps) => {
  const [project, setProject] = useState<AilabProject>(defaultProject);
  const [isProjectLoaded, setIsProjectLoaded] = useState(false);
  const previousRun = useRef<TrainingRunOutputs | undefined>(undefined);
  const onProjectChangeRef = useRef(onProjectChange);
  onProjectChangeRef.current = onProjectChange;
  /*
    A project waiting for the dataset it will be reconciled against.
  */
  const [pendingProject, setPendingProject] = useState<
    AilabProject | undefined
  >();
  // TODO: do we need all of these booleans
  const isProjectLoading = pendingProject !== undefined;
  const isDefaultProject = project === defaultProject;
  const data = useAppSelector(state => state.data);
  const presetColumns = useAppSelector(state => state.presetColumns);
  const selectableColumns = useAppSelector(getSelectableColumns);
  const lockedLabel = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const lockedFeatures = useAppSelector(state => !!state.mode?.lockFeatures);
  const columnsByDataType = useAppSelector(state => state.columnsByDataType);
  const datasetDescribed =
    data.length > 0 &&
    Object.keys(data[0]).every(column => columnsByDataType[column]);

  useResetSignal(
    useCallback(() => {
      previousRun.current = undefined;
      setProject(defaultProject);
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
      setIsProjectLoaded(true);
    },
    [selectableColumns, data, presetColumns, lockedLabel, lockedFeatures]
  );

  const openProject = useCallback((saved: AilabProject) => {
    setPendingProject(saved);
  }, []);

  /*
    From an effect rather than the initial state: the level load clears the
    dataset from a layout effect, and a project queued before that would be
    reconciled against the one the last level left behind.
  */
  useEffect(() => {
    if (initialProject) {
      setPendingProject(initialProject);
    }
  }, [initialProject]);

  useEffect(() => {
    if (pendingProject && datasetDescribed) {
      setPendingProject(undefined);
      applyProject(pendingProject);
    }
  }, [pendingProject, datasetDescribed, applyProject]);

  /*
    A level change empties the project before the lab is taken down, and what
    it would be saved to still belongs to the level being left. An emptied
    project is never worth reporting anyway.
  */
  useEffect(() => {
    if (isProjectLoaded && !isDefaultProject) {
      onProjectChangeRef.current?.(project);
    }
  }, [isProjectLoaded, isDefaultProject, project]);

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
      isProjectLoaded,
      isProjectLoading,
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
      isProjectLoaded,
      isProjectLoading,
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
