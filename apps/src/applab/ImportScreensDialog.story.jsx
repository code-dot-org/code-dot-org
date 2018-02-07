import React from 'react';
import {ScreenListItem, ImportScreensDialog} from './ImportScreensDialog';
import {action} from '@storybook/addon-actions';

const exampleHtml = `
      <div>
        <div class="screen" id="screen1">
          <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
               data-canonical-image-url="asset1.png"
               id="img2">
        </div>
      </div>
  `;
export default storybook => {
  storybook
    .storiesOf('ScreenListItem', module)
    .addStoryTable([
      {
        name: 'normal screen',
        story: () => (
          <ScreenListItem
            screen={{
              id: 'screen1',
              canBeImported: true,
              willReplace: false,
              assetsToReplace: [],
              assetsToImport: [],
              conflictingIds: [],
              html: exampleHtml,
            }}
          />
        )
      }, {
        name: 'screen which will replace some assets',
        story: () => (
          <ScreenListItem
            screen={{
              id: 'screen1',
              canBeImported: true,
              willReplace: false,
              assetsToReplace: ['hadi.png', 'code-logo.png'],
              assetsToImport: [],
              conflictingIds: [],
              html: exampleHtml,
            }}
          />
        )
      }, {
        name: 'screen which will replace an existing screen and some assets',
        story: () => (
          <ScreenListItem
            screen={{
              id: 'screen1',
              canBeImported: true,
              willReplace: true,
              assetsToReplace: ['hadi.png'],
              assetsToImport: [],
              conflictingIds: [],
              html: exampleHtml,
            }}
          />
        )
      }, {
        name: 'screen with conflicting ids which cannot be imported',
        story: () => (
          <ScreenListItem
            screen={{
              id: 'screen1',
              willReplace: false,
              assetsToReplace: [],
              assetsToImport: [],
              canBeImported: false,
              conflictingIds: ['img1', 'img2'],
              html: exampleHtml,
            }}
          />
        )
      },
    ]);


  const replacingScreen = {
    id: 'main_screen',
    willReplace: true,
    assetsToReplace: [],
    assetsToImport: [],
    canBeImported: true,
    conflictingIds: [],
    html: exampleHtml
  };
  const newScreen = {
    id: 'screen1',
    willReplace: false,
    assetsToReplace: [],
    assetsToImport: [],
    canBeImported: true,
    conflictingIds: [],
    html: exampleHtml
  };
  const conflictingScreen = {
    id: 'gameover_screen',
    willReplace: false,
    assetsToReplace: [],
    assetsToImport: [],
    canBeImported: false,
    conflictingIds: ['label1', 'label2'],
    html: exampleHtml
  };

  // TODO: stop doing this nonsense once AssetThumbnail stops relying on the
  // fact that assetsApi relies on globals.
  window.dashboard = {
    project: {
      getCurrentId() {
        return 'poke-the-pig';
      }
    }
  };
  storybook
    .storiesOf('ImportScreensDialog', module)
    .addStoryTable([
      {
        name: 'Simple single screen import',
        description: 'Importing a single screen that will replace an existing one',
        story: () => (
          <ImportScreensDialog
            hideBackdrop
            onImport={action('onImport')}
            handleClose={action('handleClose')}
            project={{
              id: 'poke-the-pig',
              name: 'Poke the Pig',
              screens: [replacingScreen],
              otherAssets: [],
            }}
          />
        )
      }, {
        name: 'Multi-screen import with conflicting element ids',
        description: `When importing screens that use element ids which are already taken
                        We show a new section indicating the screens cannot be imported.`,
        story: () => (
          <ImportScreensDialog
            hideBackdrop
            onImport={action('onImport')}
            handleClose={action('handleClose')}
            project={{
              id: 'poke-the-pig',
              name: 'Poke the Pig',
              screens: [replacingScreen, newScreen, conflictingScreen],
              otherAssets: [],
            }}
          />
        )
      }, {
        name: 'When there are no importable screens',
        description: `In the event that no screens can be imported, the screens section
                        is hidden completely.`,
        story: () => (
          <ImportScreensDialog
            hideBackdrop
            onImport={action('onImport')}
            handleClose={action('handleClose')}
            project={{
              id: 'poke-the-pig',
              name: 'Poke the Pig',
              screens: [conflictingScreen],
              otherAssets: [],
            }}
          />
        )
      }, {
        name: 'additional assets',
        description: `When importing a project that has assets which do not show up on
                        any of the screens, a new section appears with a list of those
                        assets allowing you to import them.`,
        story: () => (
          <ImportScreensDialog
            hideBackdrop
            onImport={action('onImport')}
            handleClose={action('handleClose')}
            project={{
              id: 'poke-the-pig',
              name: 'Poke the Pig',
              screens: [newScreen],
              otherAssets: [
                {filename: 'foo.png', category: "image", willReplace: false},
                {filename: 'bar.mov', category: "video", willReplace: true},
                {filename: 'bar.pdf', category: "pdf", willReplace: true},
                {filename: 'bar.doc', category: "doc", willReplace: true},
                {filename: 'bar.mp3', category: "audio", willReplace: true},
              ],
            }}
          />
        )
      }, {
        name: 'when importing',
        description: `When the import is actually taking place (which might take some time)
                        we disable on the input buttons`,
        story: () => (
          <ImportScreensDialog
            hideBackdrop
            isImporting={true}
            onImport={action('onImport')}
            handleClose={action('handleClose')}
            project={{
              id: 'poke-the-pig',
              name: 'Poke the Pig',
              screens: [newScreen],
              otherAssets: [
                {filename: 'foo.png', category: "image", willReplace: false},
                {filename: 'bar.mov', category: "video", willReplace: true},
                {filename: 'bar.pdf', category: "pdf", willReplace: true},
                {filename: 'bar.doc', category: "doc", willReplace: true},
                {filename: 'bar.mp3', category: "audio", willReplace: true},
              ],
            }}
          />
        )
      },
    ]);

};
