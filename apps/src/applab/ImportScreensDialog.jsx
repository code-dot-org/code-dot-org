/* eslint-disable react/no-danger */
/* eslint no-unused-vars: "error" */
import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import applabConstants from './constants';
import Dialog, {Body, Buttons, Confirm, Cancel} from '../templates/Dialog';
import AssetThumbnail, {
  styles as assetThumbnailStyles
} from '../code-studio/components/AssetThumbnail';
import MultiCheckboxSelector, {
  styles as multiCheckboxStyles
} from '../templates/MultiCheckboxSelector';
import color from '../color';
import {toggleImportScreen, importIntoProject} from './redux/screens';
import {
  importableAssetShape,
  importableScreenShape,
  importableProjectShape
} from './import';

const SCALE = 0.1;
const MARGIN = 10;
const ICON_HEIGHT = applabConstants.APP_HEIGHT * SCALE;

// TODO: ditch color and fontSize in favor of more unified style components when they exist.
const styles = {
  section: {
    marginTop: MARGIN * 2,
  },
  warning: {
    color: color.red,
    fontSize: 'smaller',
    margin: 0,
  },
  subtext: {
    color: color.black,
  },
  screenListItem: {
    display: 'flex',
    alignItems: 'center',
    color: color.black,
  },
  disabledScreenListItem: {
    color: color.light_gray,
  },
  assetListItem: {
    display: 'flex',
    alignItems: 'center',
  },
  assetThumbnail: {
    margin: 0,
    height: ICON_HEIGHT,
    width: ICON_HEIGHT,
    color: color.black,
  },
  assetThumbnailIcon: {
    fontSize: 25,
    margin: 0,
    lineHeight: ''+ICON_HEIGHT+'px',
  },
  assetListItemText: {
    marginLeft: MARGIN
  },
  miniScreenWrapper: {
    display: 'inline-block',
    width: applabConstants.APP_WIDTH * SCALE,
    height: ICON_HEIGHT,
    border: assetThumbnailStyles.wrapper.border,
    position: 'relative',
    marginRight: MARGIN,
  },
  miniScreen: {
    display: 'inline-block',
    position: 'absolute',
    left: 0,
    transform: `scale(${SCALE})`,
    transformOrigin: 'top left',
    width: applabConstants.APP_WIDTH,
  },
  checkbox: {
    marginRight: MARGIN,
  },
  selectAllCheckbox: {
    marginRight: MARGIN,
    position: 'relative',
    bottom: 4,
  },
};

// TODO: possibly refactor AssetRow to make it work here instead of
// or with this component
export const AssetListItem = Radium(React.createClass({
  propTypes: {
    asset: importableAssetShape,
  },

  render() {
    const {asset} = this.props;
    return (
      <div style={styles.assetListItem}>
        <AssetThumbnail
          type={asset.category}
          name={asset.filename}
          iconStyle={styles.assetThumbnailIcon}
          style={styles.assetThumbnail}
        />
        <div style={[styles.assetListItemText, styles.subtext]}>
          {asset.filename}
          {asset.willReplace &&
           <p style={styles.warning}>
             Warning: Importing this will replace your existing "{asset.filename}".
           </p>}
        </div>
      </div>
    );
  }
}));

function quotedCommaJoin(strings) {
  return strings.map(s => `"${s}"`).join(', ');
}

export const ScreenListItem = Radium(React.createClass({
  propTypes: {
    screen: importableScreenShape,
  },

  render() {
    var {screen} = this.props;
    return (
      <div
        style={[
          styles.screenListItem,
          !screen.canBeImported && styles.disabledScreenListItem
        ]}
      >
        <div style={styles.miniScreenWrapper}>
          <div
            dangerouslySetInnerHTML={{__html: screen.html}}
            style={styles.miniScreen}
          />
        </div>
        <div>
          {screen.id}
          {screen.willReplace &&
           <p style={styles.warning}>
             Importing this will replace your existing screen: "{screen.id}".
           </p>}
          {screen.assetsToReplace.length > 0 &&
           <p style={styles.warning}>
             Importing this will replace your existing
             assets: {quotedCommaJoin(screen.assetsToReplace)}.
           </p>
          }
          {screen.conflictingIds.length > 0 &&
           <p style={styles.warning}>
             Uses existing element IDs: {quotedCommaJoin(screen.conflictingIds)}.
           </p>}
        </div>
      </div>
    );
  }
}));

export const ImportScreensDialog = React.createClass({

  propTypes: Object.assign({}, Dialog.propTypes, {
    project: importableProjectShape,
    onImport: React.PropTypes.func.isRequired,
    isImporting: React.PropTypes.bool,
  }),

  getDefaultProps() {
    return {
      isImporting: false,
    };
  },

  getInitialState() {
    return {
      selectedScreens: [],
      selectedAssets: [],
    };
  },

  render() {
    if (!this.props.project) {
      return null;
    }
    const nonImportableScreens = this.props.project.screens.filter(s => !s.canBeImported);
    const importableScreens = this.props.project.screens.filter(s => s.canBeImported);
    const canImport = importableScreens.length > 0 || this.props.project.otherAssets.length > 0;
    const buttons = canImport ? (
      <Buttons>
        <Confirm
          onClick={() => this.props.onImport(
              this.props.project.id,
              this.state.selectedScreens,
              this.state.selectedAssets
            )}
          disabled={this.props.isImporting}
        >
          {this.props.isImporting && <span className="fa fa-spin fa-spinner" />}
          {this.props.isImporting && ' '}
          Import
        </Confirm>
      </Buttons>
    ) : (
      <Buttons>
        <Cancel onClick={this.props.handleClose}/>
      </Buttons>
    );

    return (
      <Dialog
        title={`Import from Project: ${this.props.project.name}`}
        {...this.props}
      >
        <Body>
          {importableScreens.length > 0 &&
           <MultiCheckboxSelector
             style={styles.section}
             header="Screens"
             items={importableScreens}
             selected={this.state.selectedScreens}
             onChange={selectedScreens => this.setState({selectedScreens})}
             itemPropName="screen"
             disabled={this.props.isImporting}
           >
             <ScreenListItem />
           </MultiCheckboxSelector>}
          {this.props.project.otherAssets.length > 0 &&
           <MultiCheckboxSelector
             style={styles.section}
             header="Other Assets"
             items={this.props.project.otherAssets}
             selected={this.state.selectedAssets}
             onChange={selectedAssets => this.setState({selectedAssets})}
             itemPropName="asset"
             disabled={this.props.isImporting}
           >
             <AssetListItem/>
           </MultiCheckboxSelector>}
          {nonImportableScreens.length > 0 &&
           <div style={styles.section}>
             <h2 style={multiCheckboxStyles.header}>Cannot Import</h2>
             <p style={styles.subtext}>
               Cannot import the following screens because they contain design elements
               with IDs already used in your existing project. Fix the IDs in either
               project so they aren't duplicated across different screens before trying
               to import the following.
             </p>
             <ul style={multiCheckboxStyles.list}>
               {nonImportableScreens.map(
                  screen => (
                    <li key={screen.id} style={multiCheckboxStyles.listItem}>
                      <ScreenListItem screen={screen}/>
                    </li>
                  )
                )}
             </ul>
           </div>}
        </Body>
        {buttons}
      </Dialog>
    );
  }
});

export default connect(
  state => ({
    isOpen: state.screens.isImportingScreen && state.screens.importProject.fetchedProject,
    project: state.screens.importProject.importableProject,
  }),
  dispatch => ({
    onImport(projectId, screens, assets) {
      dispatch(importIntoProject(projectId, screens, assets));
    },
    handleClose() {
      dispatch(toggleImportScreen(false));
    },
  })
)(ImportScreensDialog);

if (BUILD_STYLEGUIDE) {
  const exampleHtml = `
      <div>
        <div class="screen" id="screen1">
          <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
               data-canonical-image-url="asset1.png"
               id="img2">
        </div>
      </div>
  `;
  ScreenListItem.styleGuideExamples = storybook => {
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
                    canBeImported: false,
                    conflictingIds: ['img1', 'img2'],
                    html: exampleHtml,
                  }}
            />
          )
        },
      ]);
  };

  ImportScreensDialog.styleGuideExamples = storybook => {
    const replacingScreen = {
      id: 'main_screen',
      willReplace: true,
      assetsToReplace: [],
      canBeImported: true,
      conflictingIds: [],
      html: exampleHtml
    };
    const newScreen = {
      id: 'screen1',
      willReplace: false,
      assetsToReplace: [],
      canBeImported: true,
      conflictingIds: [],
      html: exampleHtml
    };
    const conflictingScreen = {
      id: 'gameover_screen',
      willReplace: false,
      assetsToReplace: [],
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
              onImport={storybook.action('onImport')}
              handleClose={storybook.action('handleClose')}
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
              onImport={storybook.action('onImport')}
              handleClose={storybook.action('handleClose')}
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
              onImport={storybook.action('onImport')}
              handleClose={storybook.action('handleClose')}
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
              onImport={storybook.action('onImport')}
              handleClose={storybook.action('handleClose')}
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
              onImport={storybook.action('onImport')}
              handleClose={storybook.action('handleClose')}
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
}
