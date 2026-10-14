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
import {getSelectableColumns} from './selectors';
import type {TrainingRun} from './trainers/types';
import {initialProject, type AilabProject, type DataRow} from './types';
import {useResetSignal, type ResetSignal} from './useResetSignal';

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

function sameColumns(columns: string[], others: string[]): boolean {
  return (
    columns.length === others.length &&
    columns.every((column, index) => column === others[index])
  );
}

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined,
);

interface ProjectProviderProps {
  children: ReactNode;
  project?: AilabProject;
  onProjectChanged?: (project: AilabProject) => void;
}

export const ProjectProvider = ({
  children,
  project: openWith,
  onProjectChanged,
}: ProjectProviderProps) => {
  const [project, setProject] = useState<AilabProject>(
    openWith ?? initialProject,
  );
  const previousRun = useRef<TrainingRunOutputs | undefined>(undefined);
  // The project the consumer last handed us or last saw, so that opening a
  // level does not look like the student editing one.
  const reported = useRef<AilabProject>(project);
  const data = useAppSelector(state => state.data);
  const presetColumns = useAppSelector(state => state.presetColumns);
  const selectableColumns = useAppSelector(getSelectableColumns);
  const lockedLabel = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const lockedFeatures = useAppSelector(state => !!state.mode?.lockFeatures);

  useResetSignal(
    useCallback(({keepsHistoricResults, levelLoad}: ResetSignal) => {
      previousRun.current = undefined;
      if (levelLoad) {
        const opening = levelLoad.project ?? initialProject;
        reported.current = opening;
        setProject(opening);
        return;
      }
      setProject(previous =>
        keepsHistoricResults
          ? {...initialProject, historicResults: previous.historicResults}
          : initialProject,
      );
    }, []),
  );

  useEffect(() => {
    if (project === reported.current) {
      return;
    }
    reported.current = project;
    onProjectChanged?.(project);
  }, [project, onProjectChanged]);

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
        selectedFeatures: sortByColumnOrder(
          features.filter(feature => feature !== previous.labelColumn),
          data,
        ),
      }));
    },
    [data],
  );

  /*
    Handle the preset columns for the project. A locked column always
    wins, since the student has no way to change it. An unlocked one will
    never replace a choice already in the project.

    This also runs against a project restored from a save, whose columns the
    dataset need not still have.
  */
  useEffect(() => {
    if (!presetColumns) {
      return;
    }
    setProject(previous => {
      let labelColumn = previous.labelColumn;
      if (
        presetColumns.labelColumn !== undefined &&
        (lockedLabel || previous.labelColumn === undefined)
      ) {
        labelColumn = presetColumns.labelColumn;
      }
      if (labelColumn !== undefined && !selectableColumns.includes(labelColumn)) {
        labelColumn = undefined;
      }

      let features = previous.selectedFeatures;
      if (
        presetColumns.selectedFeatures &&
        (lockedFeatures || previous.selectedFeatures.length === 0)
      ) {
        features = presetColumns.selectedFeatures;
      }

      const selectedFeatures = sortByColumnOrder(
        features.filter(
          feature =>
            feature !== labelColumn && selectableColumns.includes(feature),
        ),
        data,
      );

      if (
        labelColumn === previous.labelColumn &&
        sameColumns(selectedFeatures, previous.selectedFeatures)
      ) {
        return previous;
      }

      return {
        ...previous,
        labelColumn,
        selectedFeatures,
        // These columns are not the ones the saved model was built from.
        hyperparameters: undefined,
        accuracyCheckRowIndices: undefined,
      };
    });
  }, [presetColumns, lockedLabel, lockedFeatures, data, selectableColumns]);

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
