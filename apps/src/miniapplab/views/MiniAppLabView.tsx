import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useSetupBlockColor} from '@cdo/apps/blockly/utils/useSetupBlockColor';
import {LabProps} from '@cdo/apps/lab2/types';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';

import {
  refreshElementFields,
  renameElementInWorkspace,
  setDesignForBlocks,
} from '../blockly/elementField';
import {defaultBlocks, defaultDesign} from '../defaultProject';
import ProgramRunner from '../runtime/ProgramRunner';
import {
  clearSaved,
  loadBlocks as loadSavedBlocks,
  loadDesign,
  saveBlocks,
  saveDesign,
} from '../storage';
import {
  AppDesign,
  AppElement,
  ElementType,
  ElementValues,
  LabTab,
  screenHeight,
  screenWidth,
} from '../types';

import AppScreen from './AppScreen';
import DesignPanel from './DesignPanel';
import useBlocklyWorkspace, {BLOCKLY_DIV_ID} from './useBlocklyWorkspace';

import moduleStyles from './mini-app-lab.module.scss';

const elementDefaults: Record<
  ElementType,
  Pick<AppElement, 'width' | 'height' | 'text'>
> = {
  label: {width: 280, height: 28, text: 'Text'},
  input: {width: 280, height: 36, text: 'Type here'},
  button: {width: 120, height: 36, text: 'Button'},
  output: {width: 280, height: 120, text: ''},
};

const idPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** What every element shows before the program touches it. */
function designValues(design: AppDesign): ElementValues {
  return Object.fromEntries(
    design.map(element => [
      element.id,
      element.type === 'input' ? '' : element.text,
    ])
  );
}

/** Values that show the design's own text, placeholders aside. */
function previewValues(design: AppDesign): ElementValues {
  return Object.fromEntries(design.map(element => [element.id, element.text]));
}

function nextId(design: AppDesign, type: ElementType) {
  let n = 1;
  while (design.some(element => element.id === `${type}${n}`)) {
    n++;
  }
  return `${type}${n}`;
}

/** A free spot below the lowest element, back at the top when full. */
function nextPosition(design: AppDesign, height: number) {
  const bottom = design.reduce(
    (max, element) => Math.max(max, element.y + element.height),
    0
  );
  const y = bottom + 12;
  return {x: 20, y: y + height > screenHeight ? 20 : y};
}

/**
 * Mini App Lab: lay out a screen in Design, program it in Code, then Run it.
 * Written to Lab2's view contract so it can be registered as an app type
 * later; the prototype page renders it directly.
 */
const MiniAppLabView: React.FunctionComponent<Partial<LabProps>> = () => {
  // The blocks read the design through setDesignForBlocks, so it must be
  // there before the workspace loads them.
  const [design, setDesign] = useState<AppDesign>(() => {
    const saved = loadDesign();
    setDesignForBlocks(saved);
    return saved;
  });
  const [selectedId, setSelectedId] = useState<string>();
  const [tab, setTab] = useState<LabTab>('design');
  const [isRunning, setIsRunning] = useState(false);
  const [runValues, setRunValues] = useState<ElementValues>({});
  const [status, setStatus] = useState<string>();
  // Run follows the event block color, as in the other Lab2 labs.
  const setupBlockColor = useSetupBlockColor();

  const runValuesRef = useRef(runValues);
  runValuesRef.current = runValues;

  const runner = useMemo(
    () =>
      new ProgramRunner({
        getText: id => runValuesRef.current[id] ?? '',
        setText: (id, text) =>
          setRunValues(values => ({...values, [id]: text})),
        onError: message => setStatus(`Something went wrong: ${message}`),
      }),
    []
  );

  const {workspaceRef, getCode, loadBlocks, resize, refreshToolbox} =
    useBlocklyWorkspace({
      initialBlocks: loadSavedBlocks(),
      onChange: saveBlocks,
    });

  useEffect(() => {
    setDesignForBlocks(design);
    saveDesign(design);
    if (workspaceRef.current) {
      refreshElementFields(workspaceRef.current);
      refreshToolbox();
    }
  }, [design, workspaceRef, refreshToolbox]);

  useEffect(() => {
    if (tab === 'code') {
      resize();
    }
  }, [tab, resize]);

  useEffect(() => () => runner.stop(), [runner]);

  const stop = useCallback(() => {
    runner.stop();
    setIsRunning(false);
  }, [runner]);

  const run = useCallback(() => {
    setStatus(undefined);
    setRunValues(designValues(design));
    try {
      runner.start(getCode());
      setIsRunning(true);
    } catch (error) {
      runner.stop();
      setStatus(
        `The program could not start: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, [design, getCode, runner]);

  // Any design edit ends the run; the screen is being rebuilt under it.
  const editDesign = useCallback(
    (update: (design: AppDesign) => AppDesign) => {
      if (isRunning) {
        stop();
      }
      setDesign(update);
    },
    [isRunning, stop]
  );

  const onAdd = useCallback(
    (type: ElementType) => {
      const id = nextId(design, type);
      const defaults = elementDefaults[type];
      editDesign(current => [
        ...current,
        {id, type, ...defaults, ...nextPosition(current, defaults.height)},
      ]);
      setSelectedId(id);
    },
    [design, editDesign]
  );

  const onChange = useCallback(
    (id: string, changes: Partial<AppElement>) =>
      editDesign(current =>
        current.map(element =>
          element.id === id ? {...element, ...changes} : element
        )
      ),
    [editDesign]
  );

  const onMove = useCallback(
    (id: string, x: number, y: number) => onChange(id, {x, y}),
    [onChange]
  );

  const onRename = useCallback(
    (id: string, newId: string) => {
      if (newId === id) {
        return true;
      }
      if (!idPattern.test(newId) || design.some(e => e.id === newId)) {
        setStatus(
          `"${newId}" can't be used as an ID.  Use letters, numbers and underscores, and keep IDs unique.`
        );
        return false;
      }
      setStatus(undefined);
      editDesign(current =>
        current.map(element =>
          element.id === id ? {...element, id: newId} : element
        )
      );
      if (workspaceRef.current) {
        renameElementInWorkspace(workspaceRef.current, id, newId);
      }
      setSelectedId(newId);
      return true;
    },
    [design, editDesign, workspaceRef]
  );

  const onDelete = useCallback(
    (id: string) => {
      editDesign(current => current.filter(element => element.id !== id));
      setSelectedId(undefined);
    },
    [editDesign]
  );

  const onStartOver = useCallback(() => {
    if (!window.confirm('Start over with the example app?')) {
      return;
    }
    stop();
    clearSaved();
    setDesign(defaultDesign);
    setSelectedId(undefined);
    loadBlocks(defaultBlocks);
    setStatus(undefined);
  }, [stop, loadBlocks]);

  const screenMode = isRunning
    ? 'run'
    : tab === 'design'
    ? 'design'
    : 'preview';
  const screenValues = isRunning ? runValues : previewValues(design);

  return (
    <div className={moduleStyles.lab}>
      <div className={moduleStyles.topBar}>
        <h2 className={moduleStyles.title}>Mini App Lab</h2>
        <SegmentedButtons
          size="s"
          selectedButtonValue={tab}
          onChange={value => setTab(value as LabTab)}
          buttons={[
            {label: 'Design', value: 'design', iconLeft: {iconName: 'pencil'}},
            {label: 'Code', value: 'code', iconLeft: {iconName: 'code'}},
          ]}
        />
        <div className={moduleStyles.topBarRight}>
          <MuiButton
            variant="text"
            color="primary"
            size="small"
            onClick={onStartOver}
          >
            Start over
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            sx={isRunning ? undefined : getRunButtonSx(setupBlockColor)}
            startIcon={
              <FontAwesomeV6Icon iconName={isRunning ? 'stop' : 'play'} />
            }
            onClick={isRunning ? stop : run}
          >
            {isRunning ? 'Stop' : 'Run'}
          </MuiButton>
        </div>
      </div>

      {status && (
        <div className={moduleStyles.status} role="status">
          {status}
        </div>
      )}

      <div className={moduleStyles.main}>
        <div className={moduleStyles.screenColumn}>
          <PanelContainer
            id="miniapplab-screen-panel"
            headerContent={isRunning ? 'Running' : 'App'}
          >
            <div
              className={moduleStyles.screenHolder}
              style={{minWidth: screenWidth + 32}}
            >
              <AppScreen
                design={design}
                values={screenValues}
                mode={screenMode}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onMove={onMove}
                onInput={(id, text) =>
                  setRunValues(values => ({...values, [id]: text}))
                }
                onPress={id => runner.pressButton(id)}
              />
            </div>
          </PanelContainer>
        </div>

        <div className={moduleStyles.workColumn}>
          <PanelContainer
            id="miniapplab-work-panel"
            headerContent={tab === 'design' ? 'Design' : 'Code'}
          >
            <div className={moduleStyles.workBody}>
              {tab === 'design' && (
                <DesignPanel
                  design={design}
                  selectedId={selectedId}
                  onAdd={onAdd}
                  onChange={onChange}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              )}
              {/* Stays mounted so the workspace survives tab switches. */}
              <div
                className={classNames(
                  moduleStyles.blocklyHolder,
                  tab !== 'code' && moduleStyles.hidden
                )}
              >
                <div id={BLOCKLY_DIV_ID} className={moduleStyles.blockly} />
              </div>
            </div>
          </PanelContainer>
        </div>
      </div>
    </div>
  );
};

export default MiniAppLabView;
