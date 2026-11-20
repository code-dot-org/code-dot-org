import {MuiDialog} from '@code-dot-org/component-library/dialog';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Button, IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import header from '@cdo/apps/code-studio/header';
import {setProjectUpdatedUnsaved} from '@cdo/apps/code-studio/projectRedux';
import {createTourWithSteps} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {createAuthoredTourSteps} from '../authoredTourSteps';
import {TourAnchor} from '../tourAnchors';
import {getTourEvents} from '../tourEvents';
import {
  AuthoredTour,
  AuthoredTourStep,
  TourReference,
  TourUsageLevel,
} from '../types';

import TourAnchorPicker from './TourAnchorPicker';
import {
  addReferences,
  copyTour,
  moveStep,
  newStep,
  newTour,
  removeReference,
  removeStep,
  replaceStep,
  replaceTour,
  setAutoStart,
  swapReference,
} from './tourEditorState';
import {
  LevelToursView,
  LibraryView,
  OverflowMenu,
  plural,
  TourView,
} from './TourLibraryViews';
import TourStepForm from './TourStepForm';
import useStepPreview from './useStepPreview';

import styles from './authored-tour-editor.module.scss';

type Tab = 'level' | 'library';

type View =
  | {name: Tab}
  | {name: 'tour'; tourId: string}
  | {name: 'step'; tourId: string; stepId: string};

const TABS: {label: string; value: Tab}[] = [
  {label: 'This level', value: 'level'},
  {label: 'Library', value: 'library'},
];

// The levelbuilder's product tour editor. It sits beside the running lab so
// the author can use the lab to reach the state a step describes, point the
// step at part of it, and see the step as a student will. Tours belong to the
// lab's library; the level only chooses which of them it uses. A tour opens
// read-only, so browsing the library cannot change other levels by accident.
const AuthoredTourEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const levelId = levelProperties?.id;
  const appName = levelProperties?.appName;
  const events = useMemo(() => getTourEvents(appName), [appName]);

  const [library, setLibrary] = useState<AuthoredTour[]>([]);
  const [references, setReferences] = useState<TourReference[]>([]);
  // Tours sent with every save, so a save that failed is retried by the next.
  const [editedIds, setEditedIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tab, setTab] = useState<Tab>('level');
  const [view, setView] = useState<View>({name: 'level'});
  const [editingTourId, setEditingTourId] = useState<string>();
  const [confirmEditTourId, setConfirmEditTourId] = useState<string>();
  const [isPicking, setIsPicking] = useState(false);
  const [playingTourId, setPlayingTourId] = useState<string>();
  const editorRef = useRef<HTMLElement>(null);

  // Loads the lab's library and the level's references once per level.
  useEffect(() => {
    setLibrary(levelProperties?.productTourLibrary ?? []);
    setReferences(levelProperties?.tourReferences ?? []);
    setEditedIds([]);
    setDeletedIds([]);
    setHasUnsavedChanges(false);
    setTab('level');
    setView({name: 'level'});
    setEditingTourId(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  const changesRef = useRef({library, references, editedIds, deletedIds});
  changesRef.current = {library, references, editedIds, deletedIds};
  useEffect(() => {
    if (levelId === undefined) {
      return;
    }
    header.showLevelBuilderSaveButton(
      () => {
        setHasUnsavedChanges(false);
        const changes = changesRef.current;
        return {
          tourReferences: changes.references,
          tours: changes.library.filter(tour =>
            changes.editedIds.includes(tour.id)
          ),
          deletedTourIds: changes.deletedIds,
        };
      },
      'Levelbuilder: edit product tours',
      `/levels/${levelId}/update_product_tours`
    );
  }, [levelId]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges]);

  const markUnsaved = () => {
    setHasUnsavedChanges(true);
    dispatch(setProjectUpdatedUnsaved());
  };
  const updateReferences = (updated: TourReference[]) => {
    setReferences(updated);
    markUnsaved();
  };
  const addTourToLibrary = (tour: AuthoredTour) => {
    setLibrary(current => [...current, tour]);
    setEditedIds(current => [...current, tour.id]);
  };
  const updateTour = (tour: AuthoredTour) => {
    setLibrary(current => replaceTour(current, tour));
    setEditedIds(current =>
      current.includes(tour.id) ? current : [...current, tour.id]
    );
    markUnsaved();
  };

  const tourId = 'tourId' in view ? view.tourId : undefined;
  const selectedTour = library.find(tour => tour.id === tourId);
  const isEditing = !!selectedTour && editingTourId === selectedTour.id;
  const stepId = view.name === 'step' ? view.stepId : undefined;
  const selectedStepIndex =
    selectedTour?.steps.findIndex(step => step.id === stepId) ?? -1;
  const selectedStep = selectedTour?.steps[selectedStepIndex];
  const stepCount = selectedTour?.steps.length ?? 0;

  const isOnLevel = (id: string) =>
    references.some(reference => reference.id === id);

  // The levels that use a tour, with this level as edited, not as saved.
  const usedOn = (id: string): TourUsageLevel[] => {
    const usage = levelProperties?.productTourUsage?.[id] ?? [];
    const others = usage.filter(level => level.id !== levelId);
    if (!isOnLevel(id) || levelId === undefined) {
      return others;
    }
    const name = levelProperties?.name ?? 'This level';
    const here = usage.find(level => level.id === levelId) ?? {
      id: levelId,
      name,
      label: name,
      url: `/levels/${levelId}/edit`,
    };
    return [here, ...others];
  };
  const usedElsewhere = (id: string) =>
    usedOn(id).filter(level => level.id !== levelId).length;

  const showTab = (next: Tab) => {
    setIsPicking(false);
    setEditingTourId(undefined);
    setTab(next);
    setView({name: next});
  };
  const openTour = (id: string) => {
    setIsPicking(false);
    if (editingTourId !== id) {
      setEditingTourId(undefined);
    }
    setView({name: 'tour', tourId: id});
  };
  const openStep = (id: string, step: string) => {
    setIsPicking(false);
    setView({name: 'step', tourId: id, stepId: step});
  };

  const startEditing = (id: string) => {
    setConfirmEditTourId(undefined);
    setEditingTourId(id);
    if (tourId !== id) {
      setView({name: 'tour', tourId: id});
    }
  };
  // Editing a tour that other levels use changes it there too, so ask first.
  const requestEdit = (id: string) =>
    usedElsewhere(id) > 0 ? setConfirmEditTourId(id) : startEditing(id);

  // A copy of a tour this level uses takes its place on the level.
  const duplicateTour = (id: string) => {
    const original = library.find(tour => tour.id === id);
    if (!original) {
      return;
    }
    const copy = copyTour(original);
    addTourToLibrary(copy);
    setReferences(current => swapReference(current, id, copy.id));
    markUnsaved();
    startEditing(copy.id);
    setView({name: 'tour', tourId: copy.id});
  };

  const createTour = () => {
    const tour = newTour(library);
    addTourToLibrary(tour);
    markUnsaved();
    startEditing(tour.id);
    setView({name: 'tour', tourId: tour.id});
  };

  const deleteTour = (tour: AuthoredTour) => {
    if (!window.confirm(`Delete the tour "${tour.name}" from the library?`)) {
      return;
    }
    setLibrary(current => current.filter(other => other.id !== tour.id));
    setReferences(current => removeReference(current, tour.id));
    setEditedIds(current => current.filter(id => id !== tour.id));
    setDeletedIds(current => [...current, tour.id]);
    markUnsaved();
    showTab('library');
  };

  const addStep = () => {
    if (selectedTour) {
      const step = newStep();
      updateTour({...selectedTour, steps: [...selectedTour.steps, step]});
      openStep(selectedTour.id, step.id);
    }
  };
  const updateStep = (step: AuthoredTourStep) =>
    selectedTour && updateTour(replaceStep(selectedTour, step));

  // A dialog's focus trap would pull focus out of the editor's fields. Our
  // listener is added before any dialog opens, so it runs before the trap's.
  useEffect(() => {
    const keepFocusInEditor = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        editorRef.current?.contains(event.target)
      ) {
        event.stopImmediatePropagation();
      }
    };
    document.addEventListener('focusin', keepFocusInEditor);
    return () => document.removeEventListener('focusin', keepFocusInEditor);
  }, []);

  // Option+P (Alt+P) starts picking without a click, which would close a menu
  // that is open in the lab.
  const canPick = !!selectedStep && isEditing && !playingTourId;
  useEffect(() => {
    if (!canPick) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === 'KeyP') {
        event.preventDefault();
        setIsPicking(true);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [canPick]);

  const selectedStepRef = useRef({selectedTour, selectedStep});
  selectedStepRef.current = {selectedTour, selectedStep};
  const onPick = useCallback(
    (anchor: TourAnchor) => {
      setIsPicking(false);
      const {selectedTour: tour, selectedStep: step} = selectedStepRef.current;
      if (tour && step) {
        updateTour(
          replaceStep(tour, {
            ...step,
            anchor: anchor.name,
            anchorLabel: anchor.label,
          })
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onCancelPick = useCallback(() => setIsPicking(false), []);

  const {targetMissing} = useStepPreview({
    step: selectedStep,
    index: selectedStepIndex,
    stepCount,
    appName,
    enabled: !isPicking && !playingTourId,
  });

  // Plays a tour as a student will see it.
  const libraryRef = useRef(library);
  libraryRef.current = library;
  useEffect(() => {
    const tourToPlay = libraryRef.current.find(
      tour => tour.id === playingTourId
    );
    if (!tourToPlay) {
      return;
    }
    const tour = createTourWithSteps(
      createAuthoredTourSteps(tourToPlay, appName)
    );
    const stop = () => setPlayingTourId(undefined);
    tour.on('complete', stop);
    tour.on('cancel', stop);
    tour.start();
    return () => {
      if (tour.isActive()) {
        tour.cancel();
      }
    };
  }, [playingTourId, appName]);
  const play = (id: string) => {
    setIsPicking(false);
    setPlayingTourId(id);
  };

  if (!levelProperties || levelId === undefined) {
    return null;
  }

  const back = () => {
    setIsPicking(false);
    setPlayingTourId(undefined);
    if (view.name === 'step') {
      setView({name: 'tour', tourId: view.tourId});
    } else {
      showTab(tab);
    }
  };

  const isTabView = view.name === 'level' || view.name === 'library';
  const title = isTabView
    ? 'Product tours'
    : view.name === 'step'
    ? isEditing
      ? 'Edit step'
      : 'Preview step'
    : isEditing
    ? 'Edit tour'
    : 'Preview tour';

  const tourMenu = (tour: AuthoredTour): ActionDropdownOption[] => {
    const duplicate: ActionDropdownOption = {
      value: 'duplicate',
      label: 'Duplicate tour',
      icon: {iconName: 'copy'},
      onClick: () => duplicateTour(tour.id),
    };
    if (!isEditing) {
      return [
        {
          value: 'edit',
          label: 'Edit tour',
          icon: {iconName: 'pencil'},
          onClick: () => requestEdit(tour.id),
        },
        duplicate,
        ...(isOnLevel(tour.id)
          ? [
              {
                value: 'remove',
                label: 'Remove from level',
                icon: {iconName: 'xmark'},
                isOptionDestructive: true,
                onClick: () =>
                  updateReferences(removeReference(references, tour.id)),
              },
            ]
          : []),
      ];
    }
    if (view.name === 'step' && selectedStep) {
      return [
        {
          value: 'earlier',
          label: 'Move step earlier',
          icon: {iconName: 'arrow-up'},
          isOptionDisabled: selectedStepIndex === 0,
          onClick: () => updateTour(moveStep(tour, selectedStep.id, -1)),
        },
        {
          value: 'later',
          label: 'Move step later',
          icon: {iconName: 'arrow-down'},
          isOptionDisabled: selectedStepIndex === stepCount - 1,
          onClick: () => updateTour(moveStep(tour, selectedStep.id, 1)),
        },
        {
          value: 'delete-step',
          label: 'Delete step',
          icon: {iconName: 'trash'},
          isOptionDestructive: true,
          onClick: () => {
            updateTour(removeStep(tour, selectedStep.id));
            setView({name: 'tour', tourId: tour.id});
          },
        },
      ];
    }
    return [
      duplicate,
      {
        value: 'delete',
        label: usedElsewhere(tour.id)
          ? 'Delete tour (used on other levels)'
          : 'Delete tour',
        icon: {iconName: 'trash'},
        isOptionDestructive: true,
        isOptionDisabled: usedElsewhere(tour.id) > 0,
        onClick: () => deleteTour(tour),
      },
    ];
  };

  const renderBody = () => {
    if (view.name === 'level') {
      return (
        <LevelToursView
          library={library}
          references={references}
          usageCount={id => usedOn(id).length}
          onOpenTour={openTour}
          onPlay={play}
          onEdit={requestEdit}
          onDuplicate={duplicateTour}
          onSetAutoStart={(id, autoStart) =>
            updateReferences(setAutoStart(references, id, autoStart))
          }
          onRemove={id => updateReferences(removeReference(references, id))}
          onBrowseLibrary={() => showTab('library')}
        />
      );
    }
    if (view.name === 'library') {
      return (
        <LibraryView
          library={library}
          usageCount={id => usedOn(id).length}
          onOpenTour={openTour}
        />
      );
    }
    if (!selectedTour) {
      return (
        <Typography variant="body3" className={styles.hint}>
          This tour is no longer in the library.
        </Typography>
      );
    }
    if (view.name === 'step' && selectedStep) {
      return (
        <TourStepForm
          step={selectedStep}
          isLast={selectedStepIndex === stepCount - 1}
          events={events}
          readOnly={!isEditing}
          isPicking={isPicking}
          targetMissing={targetMissing}
          onChange={updateStep}
          onPickTarget={() => setIsPicking(true)}
          onCancelPick={onCancelPick}
        />
      );
    }
    return (
      <TourView
        tour={selectedTour}
        usedOn={usedOn(selectedTour.id)}
        currentLevelId={levelId}
        isEditing={isEditing}
        onRename={name => updateTour({...selectedTour, name})}
        onOpenStep={id => openStep(selectedTour.id, id)}
        onAddStep={addStep}
      />
    );
  };

  const renderFooter = () => {
    if (view.name === 'library') {
      return (
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          className={styles.footerButton}
          startIcon={<FontAwesomeV6Icon iconName="plus" aria-hidden="true" />}
          onClick={createTour}
        >
          Create a new tour
        </Button>
      );
    }
    if (!selectedTour) {
      return null;
    }
    if (view.name === 'step') {
      const goTo = (index: number) =>
        openStep(selectedTour.id, selectedTour.steps[index].id);
      return (
        <>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={
              <FontAwesomeV6Icon iconName="arrow-left" aria-hidden="true" />
            }
            disabled={selectedStepIndex <= 0}
            onClick={() => goTo(selectedStepIndex - 1)}
          >
            Previous step
          </Button>
          <span className={styles.spacer} />
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            endIcon={
              <FontAwesomeV6Icon iconName="arrow-right" aria-hidden="true" />
            }
            disabled={selectedStepIndex >= stepCount - 1}
            onClick={() => goTo(selectedStepIndex + 1)}
          >
            Next step
          </Button>
        </>
      );
    }
    const playButton = (variant: 'outlined' | 'contained') => (
      <Button
        variant={variant}
        color={variant === 'contained' ? 'primary' : 'secondary'}
        size="small"
        className={styles.footerButton}
        startIcon={<FontAwesomeV6Icon iconName="play" aria-hidden="true" />}
        disabled={stepCount === 0 || !!playingTourId}
        onClick={() => play(selectedTour.id)}
      >
        {playingTourId ? 'Playing' : 'Play tour'}
      </Button>
    );
    if (isEditing) {
      return (
        <>
          {playButton('outlined')}
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={styles.footerButton}
            onClick={() => setEditingTourId(undefined)}
          >
            Done editing
          </Button>
        </>
      );
    }
    const onLevel = isOnLevel(selectedTour.id);
    return (
      <>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          className={styles.footerButton}
          startIcon={
            <FontAwesomeV6Icon
              iconName={onLevel ? 'xmark' : 'plus'}
              aria-hidden="true"
            />
          }
          onClick={() =>
            updateReferences(
              onLevel
                ? removeReference(references, selectedTour.id)
                : addReferences(references, [selectedTour.id])
            )
          }
        >
          {onLevel ? 'Remove from level' : 'Add to level'}
        </Button>
        {playButton('contained')}
      </>
    );
  };

  const footer = renderFooter();
  const confirmTour = library.find(tour => tour.id === confirmEditTourId);

  return (
    <aside
      ref={editorRef}
      className={styles.editor}
      aria-label="Product tour editor"
    >
      <div className={styles.header}>
        <span className={styles.headerAction}>
          {!isTabView && (
            <IconButton
              size="extraSmall"
              variant="text"
              color="tertiary"
              aria-label="Back"
              onClick={back}
            >
              <FontAwesomeV6Icon iconName="arrow-left" />
            </IconButton>
          )}
        </span>
        <Typography component="h2" variant="overline2" className={styles.title}>
          {title}
        </Typography>
        <span className={styles.headerAction}>
          {selectedTour && (
            <OverflowMenu
              name="tour-editor-menu"
              label={view.name === 'step' ? 'Step options' : 'Tour options'}
              options={tourMenu(selectedTour)}
            />
          )}
        </span>
      </div>

      {view.name === 'step' && selectedTour && (
        <ol className={styles.stepper} aria-label="Steps">
          {selectedTour.steps.map((step, index) => (
            <li key={step.id} className={styles.stepperItem}>
              <button
                type="button"
                className={classNames(
                  styles.stepperNumber,
                  index === selectedStepIndex && styles.stepperNumberCurrent
                )}
                aria-label={`Step ${index + 1}: ${
                  step.title || 'Untitled step'
                }`}
                aria-current={index === selectedStepIndex ? 'step' : undefined}
                onClick={() => openStep(selectedTour.id, step.id)}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className={styles.body}>
        {isTabView && (
          <SegmentedButtons
            size="s"
            buttons={TABS}
            selectedButtonValue={tab}
            onChange={value => showTab(value as Tab)}
          />
        )}
        {renderBody()}
      </div>

      {footer && <div className={styles.footer}>{footer}</div>}

      {confirmTour && (
        <MuiDialog
          title="Edit a shared tour?"
          description={`This tour is on ${plural(
            usedElsewhere(confirmTour.id),
            'other level'
          )}. Edits change it there too. To change it only for this level, make a copy.`}
          primaryButtonProps={{
            children: 'Edit for all levels',
            onClick: () => startEditing(confirmTour.id),
          }}
          secondaryButtonProps={{
            children: 'Make a copy',
            onClick: () => {
              setConfirmEditTourId(undefined);
              duplicateTour(confirmTour.id);
            },
          }}
          onClose={() => setConfirmEditTourId(undefined)}
          closeLabel="Cancel"
        />
      )}

      {isPicking && (
        <TourAnchorPicker
          appName={appName}
          editorRef={editorRef}
          onPick={onPick}
          onCancel={onCancelPick}
        />
      )}
    </aside>
  );
};

export default AuthoredTourEditor;
