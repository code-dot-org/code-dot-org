import type {} from '@code-dot-org/component-library/themes';
import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import {CodeStudioConfig} from '@code-dot-org/core';
import type {LevelPropertiesMap} from '@code-dot-org/core/api';
import * as Observability from '@code-dot-org/core/plugins/observability';

import {NeighborhoodSignalTypes} from './constants';
import {NeighborhoodInputsContext} from './NeighborhoodInputsContext';
import {NeighborhoodMiniApp} from './NeighborhoodMiniApp';
import NeighborhoodPreview from './NeighborhoodPreview';
import {loadNeighborhoodSkin} from './skin';
import type {
  ConsoleSignal,
  NeighborhoodSignal,
  NeighborhoodLevelProperties,
} from './types';

import moduleStyles from './neighborhood.module.scss';

// Canned signals the inspector can inject. Each button calls
// miniApp.handleSignal() with the value, which appends to the queue.
// Defaults assume one painter with id=1; INITIALIZE_PAINTER must run
// before the others have anything to act on.
// Some buttons emit one signal, others a small sequence (e.g. Turn
// Right has no protocol signal — it's three TURN_LEFTs, matching how
// the Python emitter implements it).
const SIGNAL_PRESETS: ReadonlyArray<{
  label: string;
  signals: NeighborhoodSignal[];
}> = [
  {
    label: 'Initialize',
    signals: [
      {
        value: NeighborhoodSignalTypes.INITIALIZE_PAINTER,
        detail: {id: 1, x: '0', y: '0', direction: 'south'},
      },
    ],
  },
  {
    label: 'Move North',
    signals: [
      {
        value: NeighborhoodSignalTypes.MOVE,
        detail: {id: 1, direction: 'north'},
      },
    ],
  },
  {
    label: 'Move East',
    signals: [
      {
        value: NeighborhoodSignalTypes.MOVE,
        detail: {id: 1, direction: 'east'},
      },
    ],
  },
  {
    label: 'Move South',
    signals: [
      {
        value: NeighborhoodSignalTypes.MOVE,
        detail: {id: 1, direction: 'south'},
      },
    ],
  },
  {
    label: 'Move West',
    signals: [
      {
        value: NeighborhoodSignalTypes.MOVE,
        detail: {id: 1, direction: 'west'},
      },
    ],
  },
  {
    label: 'Turn Left',
    signals: [{value: NeighborhoodSignalTypes.TURN_LEFT, detail: {id: 1}}],
  },
  {
    label: 'Turn Right (×3 Left)',
    signals: [
      {value: NeighborhoodSignalTypes.TURN_LEFT, detail: {id: 1}},
      {value: NeighborhoodSignalTypes.TURN_LEFT, detail: {id: 1}},
      {value: NeighborhoodSignalTypes.TURN_LEFT, detail: {id: 1}},
    ],
  },
  {
    label: 'Paint Red',
    signals: [
      {
        value: NeighborhoodSignalTypes.PAINT,
        detail: {id: 1, color: 'Red'},
      },
    ],
  },
  {
    label: 'Paint Blue',
    signals: [
      {
        value: NeighborhoodSignalTypes.PAINT,
        detail: {id: 1, color: 'Blue'},
      },
    ],
  },
  {
    label: 'Remove Paint',
    signals: [{value: NeighborhoodSignalTypes.REMOVE_PAINT, detail: {id: 1}}],
  },
  {
    label: 'Hide Painter',
    signals: [{value: NeighborhoodSignalTypes.HIDE_PAINTER, detail: {id: 1}}],
  },
  {
    label: 'Show Painter',
    signals: [{value: NeighborhoodSignalTypes.SHOW_PAINTER, detail: {id: 1}}],
  },
  {
    label: 'Done',
    signals: [{value: NeighborhoodSignalTypes.DONE}],
  },
];

// Render one queue entry. Console signals carry the message in
// `detail`; neighborhood signals stringify their detail object so the
// inspector shows id/direction/color at a glance.
function formatSignal(s: NeighborhoodSignal | ConsoleSignal): string {
  if (typeof s.detail === 'string') return `${s.value}: ${s.detail}`;
  if (s.detail) return `${s.value} ${JSON.stringify(s.detail)}`;
  return s.value;
}

// Test level the standalone preview boots against. Used for its
// `baseAssetUrl` so the skin loader points at real maze assets.
const TEST_LEVEL_ID = 46446;

function App() {
  const [levelPropertiesMap, setLevelPropertiesMap] = useState<
    LevelPropertiesMap | undefined
  >();

  useEffect(() => {
    Observability.logger.info('Neighborhood MiniApp mounted', {
      environment: CodeStudioConfig.environment,
      source: 'neighborhood-mini-app',
    });
    Observability.metrics.count('neighborhood_mini_app.app_mounted', 1, {
      environment: CodeStudioConfig.environment,
      source: 'neighborhood-mini-app',
    });

    setLevelPropertiesMap({
      [TEST_LEVEL_ID]: {
        skipUrl: '/projects/pythonlab/new',
        startSources: {
          files: {
            '0': {
              id: '0',
              name: 'main.py',
              language: 'py',
              contents:
                "from neighborhood import Painter\n\np1 = Painter(0,0,'South',2)\np2 = Painter(1,0)\np2.turn_left()\np1.move()\np1.move()\np1.paint('Red')\np1.turn_left()\np1.move()\np1.paint('Blue')\n",
              folderId: '0',
              active: false,
              open: true,
              type: 'locked_starter',
            },
            '2': {
              id: '2',
              name: 'support.py',
              language: 'py',
              contents: '',
              folderId: '0',
              active: false,
              open: true,
              type: 'support',
            },
          },
          folders: {},
          openFiles: ['0', '2'],
        },
        longInstructions: '## Neighborhood level with validation\r\n',
        hideShareAndRemix: true,
        teacherMarkdown: 'Teachers should see this extra info.',
        aiTutorAvailable: true,
        submittable: false,
        predictSettings: {isPredictLevel: false},
        serializedMaze: [
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
          [
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
            {tileType: 1, value: 0, assetId: 0},
          ],
        ],
        enableMicroBit: false,
        miniApp: 'neighborhood',
        validationFile: {
          id: '4',
          name: 'test_neighborhood.py',
          language: 'py',
          contents:
            "import unittest\nfrom unittest_runner import ValidationProtocol\n\nclass TestNeighborhood(unittest.TestCase):\n  def test_validation_protocol(self):\n    neighborhood_log = ValidationProtocol().get_neighborhood_log()\n    painter_logs = neighborhood_log.painter_logs\n    painter_log_1 = painter_logs[0]\n    painter_log_2 = painter_logs[1]\n    assert painter_log_1.did_action_exactly('PAINT', 2) is True\n    assert painter_log_2.did_action_exactly('TURN_LEFT', 1) is True\n    grid_size = 8\n    expected_neighborhood_state = [[False for _ in range(grid_size)] for _ in range(grid_size)]\n    # expected_neighborhood_state[2][0] = 'Red'\n    # expected_neighborhood_state[2][1] = 'Blue'\n    # assert neighborhood_log.final_output_matches(expected_neighborhood_state)\n    expected_neighborhood_state[2][0] = True\n    expected_neighborhood_state[2][1] = True\n    assert neighborhood_log.final_output_contains_paint(expected_neighborhood_state)\n    assert painter_log_1.ending_position.x == 1\n    assert painter_log_1.ending_position.y == 2\n    assert painter_log_1.ending_position.direction == 'east'\n    painter_2_events = painter_log_2.get_events()\n    assert len(painter_2_events) == 1\n    assert painter_2_events[0].neighborhood_action_type == 'TURN_LEFT'",
          folderId: '0',
          active: false,
          open: false,
          type: 'validation',
        },
        offerBrowserTts: false,
        disableEditRunForSubmission: false,
        widgetView: false,
        widgetViewAllowShowCode: false,
        containedLevelNames: null,
        name: 'Allthethings Python Lab 9',
        id: 65611,
        helpVideos: [],
        type: 'Pythonlab',
        appName: 'pythonlab',
        useRestrictedSongs: false,
        usesProjects: true,
        baseAssetUrl: '/blockly/',
        isAssessment: null,
        enableBlocklyKeyboardNavigation: null,
        validations: [
          {
            conditions: [{name: 'PASSED_ALL_TESTS', value: true}],
            message: '',
            next: true,
          },
        ],
        showExemplarLink: null,
        exemplarSources: null,
        parentLevelName: null,
      },
    });
  }, []);

  // The dashboard endpoint returns `Record<string, LevelProperties>`;
  // for a one-level fetch the first entry is the level we asked for.
  const levelProperties: NeighborhoodLevelProperties | null = useMemo(() => {
    if (!levelPropertiesMap) return null;

    const ret = (Object.values(levelPropertiesMap)[0] ??
      null) as unknown as NeighborhoodLevelProperties | null;

    return ret
      ? {
          ...ret,
          baseAssetUrl: `${CodeStudioConfig.dashboardApiUrl}${ret.baseAssetUrl}`,
        }
      : ret;
  }, [levelPropertiesMap]);

  // Construct the mini-app once. Output callbacks route to the dev
  // console rather than a ConsoleManager — there isn't one here.
  // setIsRunning is a no-op since this App has no run lifecycle.
  const miniApp = useMemo(
    () =>
      new NeighborhoodMiniApp({
        onOutputMessage: msg =>
          console.log('[neighborhood-mini-app stdout]', msg),
        onNewlineMessage: () => console.log('[neighborhood-mini-app stdout]'),
        onPartialOutputMessage: msg =>
          console.log('[neighborhood-mini-app stdout partial]', msg),
        setIsRunning: () => {},
      }),
    [],
  );

  // Build the skin once levelProperties is available. The skin
  // loader resolves every URL relative to `baseAssetUrl`, which is
  // environment-specific — local apps backend in dev, production
  // when pointed at studio.code.org. The cast is needed because
  // `baseAssetUrl` is a Codebridge-side extension to LevelProperties
  // that the core/api type doesn't expose yet.
  const skin = useMemo(() => {
    const baseAssetUrl = (levelProperties as {baseAssetUrl?: string} | null)
      ?.baseAssetUrl;
    if (!baseAssetUrl) return null;
    return loadNeighborhoodSkin(path => baseAssetUrl + path);
  }, [levelProperties]);

  const inputs = useMemo(
    () => ({
      miniApp,
      levelProperties,
      skin,
      serializedMaze: levelProperties
        ? JSON.stringify(levelProperties.serializedMaze)
        : undefined,
    }),
    [miniApp, levelProperties, skin],
  );

  // Poll the mini-app's queue snapshot so the inspector reflects both
  // injection (handleSignal) and consumption (processSignals advances
  // nextSignalIndex). 100ms is fast enough for the eye but slow enough
  // not to thrash React; the queue size is small so per-tick diff is
  // cheap.
  const [queue, setQueue] = useState<{
    signals: ReadonlyArray<NeighborhoodSignal | ConsoleSignal>;
    nextSignalIndex: number;
  }>({signals: [], nextSignalIndex: 0});

  useEffect(() => {
    const id = setInterval(() => {
      setQueue(miniApp.getQueueSnapshot());
    }, 100);
    return () => clearInterval(id);
  }, [miniApp]);

  return (
    <>
      <h1>Neighborhood MiniApp</h1>
      <NeighborhoodInputsContext.Provider value={inputs}>
        <>
          <div className={moduleStyles.container}>
            <NeighborhoodPreview />
          </div>
          <Typography variant="h6" component="h2">
            Demo mini-app loaded.
          </Typography>
          <div className={moduleStyles.buttons}>
            <Button
              variant="contained"
              color="primary"
              size="extraSmall"
              onClick={() => miniApp.onRun()}
            >
              Run
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="extraSmall"
              onClick={() => miniApp.reset()}
            >
              Reset
            </Button>
          </div>
          <Typography variant="body2" component="p">
            Inject signals (queued in order; click Run to start processing):
          </Typography>
          <div className={moduleStyles.buttons}>
            {SIGNAL_PRESETS.map(({label, signals}) => (
              <Button
                key={label}
                variant="contained"
                color="secondary"
                size="extraSmall"
                onClick={() => signals.forEach(s => miniApp.handleSignal(s))}
              >
                {label}
              </Button>
            ))}
          </div>
          <Typography variant="body2" component="p">
            Queue ({queue.nextSignalIndex}/{queue.signals.length} consumed):
          </Typography>
          <ol className={moduleStyles.queue}>
            {queue.signals.length === 0 ? (
              <li className={moduleStyles.queueEmpty}>(empty)</li>
            ) : (
              queue.signals.map((s, i) => (
                <li
                  key={i}
                  className={`${moduleStyles.queueItem} ${
                    i < queue.nextSignalIndex
                      ? moduleStyles.queueItemConsumed
                      : moduleStyles.queueItemPending
                  }`}
                >
                  {formatSignal(s)}
                </li>
              ))
            )}
          </ol>
        </>
      </NeighborhoodInputsContext.Provider>
      <p>Dashboard: {CodeStudioConfig.dashboardApiUrl}</p>
    </>
  );
}

export default App;
