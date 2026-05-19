import type {} from '@code-dot-org/component-library/themes';
import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

import {CodeStudioConfig} from '@code-dot-org/core';
import type {LevelProperties, LevelPropertiesMap} from '@code-dot-org/core/api';
import * as Observability from '@code-dot-org/core/plugins/observability';

import {NeighborhoodInputsContext} from './NeighborhoodInputsContext';
import {NeighborhoodMiniApp} from './NeighborhoodMiniApp';
import NeighborhoodPreview from './NeighborhoodPreview';
import {loadNeighborhoodSkin} from './skin';

import moduleStyles from './neighborhood.module.scss';

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
        encrypted: 'false',
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
        hideShareAndRemix: 'true',
        teacherMarkdown: 'Teachers should see this extra info.',
        aiTutorAvailable: 'true',
        submittable: 'false',
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
        enableMicroBit: 'false',
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
        offerBrowserTts: 'false',
        disableEditRunForSubmission: 'false',
        widgetView: 'false',
        widgetViewAllowShowCode: 'false',
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
            conditions: [{name: 'PASSED_ALL_TESTS', value: 'true'}],
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
  const levelProperties: LevelProperties | null = useMemo(() => {
    if (!levelPropertiesMap) return null;

    const ret = Object.values(levelPropertiesMap)[0] ?? null;

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
        : null,
    }),
    [miniApp, levelProperties, skin],
  );

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
              onClick={() => {}}
            >
              Run
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="extraSmall"
              onClick={() => {}}
            >
              Reset
            </Button>
          </div>
        </>
      </NeighborhoodInputsContext.Provider>
      <p>Dashboard: {CodeStudioConfig.dashboardApiUrl}</p>
    </>
  );
}

export default App;
