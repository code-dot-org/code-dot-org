/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import Radium from 'radium';
import {connect} from 'react-redux';
import * as applabConstants from './constants';
import Dialog, {Body, Buttons, Confirm, Cancel} from '../templates/Dialog';
import AssetThumbnail, {
  styles as assetThumbnailStyles
} from '../code-studio/components/AssetThumbnail';
import MultiCheckboxSelector, {
  styles as multiCheckboxStyles
} from '../templates/MultiCheckboxSelector';
import color from '../util/color';
import {toggleImportScreen, importIntoProject} from './redux/screens';
import {
  importableAssetShape,
  importableScreenShape,
  importableProjectShape
} from './import';
import Sounds from '../Sounds';

const SCALE = 0.1;
const MARGIN = 10;
const ICON_HEIGHT = applabConstants.APP_HEIGHT * SCALE;

// TODO: possibly refactor AssetRow to make it work here instead of
// or with this component
class AssetListItemUnwrapped extends React.Component {
  static propTypes = {
    asset: importableAssetShape,
    projectId: PropTypes.string,
    soundPlayer: PropTypes.object
  };

  render() {
    const {asset, projectId, soundPlayer} = this.props;
    return (
      <div style={styles.assetListItem}>
        <AssetThumbnail
          type={asset.category}
          name={asset.filename}
          iconStyle={styles.assetThumbnailIcon}
          style={styles.assetThumbnail}
          projectId={projectId}
          soundPlayer={soundPlayer}
        />
        <div style={[styles.assetListItemText, styles.subtext]}>
          {asset.filename}
          {asset.willReplace && (
            <p style={styles.warning}>
              Warning: Importing this will replace your existing "
              {asset.filename}".
            </p>
          )}
        </div>
      </div>
    );
  }
}
export const AssetListItem = Radium(AssetListItemUnwrapped);

function quotedCommaJoin(strings) {
  return strings.map(s => `"${s}"`).join(', ');
}

class ScreenListItemUnwrapped extends React.Component {
  static propTypes = {
    screen: importableScreenShape
  };

  render() {
    const {screen} = this.props;
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
          {screen.conflictingIds.length === 0 && screen.willReplace && (
            <p style={styles.warning}>
              Importing this will replace your existing screen: "{screen.id}".
            </p>
          )}
          {screen.conflictingIds.length === 0 &&
            screen.assetsToReplace.length > 0 && (
              <p style={styles.warning}>
                Importing this will replace your existing assets:{' '}
                {quotedCommaJoin(screen.assetsToReplace)}.
              </p>
            )}
          {screen.conflictingIds.length > 0 && (
            <p style={styles.warning}>
              Uses existing element IDs:{' '}
              {quotedCommaJoin(screen.conflictingIds)}.
            </p>
          )}
        </div>
      </div>
    );
  }
}
export const ScreenListItem = Radium(ScreenListItemUnwrapped);

export class ImportScreensDialog extends React.Component {
  static propTypes = {
    ...Dialog.propTypes,
    project: importableProjectShape,
    onImport: PropTypes.func.isRequired,
    isImporting: PropTypes.bool
  };

  static defaultProps = {isImporting: false};

  state = {
    selectedScreens: [],
    selectedAssets: []
  };

  componentDidMount() {
    this.sounds = new Sounds();
  }

  render() {
    if (!this.props.project) {
      return null;
    }
    const nonImportableScreens = this.props.project.screens.filter(
      s => !s.canBeImported
    );
    const importableScreens = this.props.project.screens.filter(
      s => s.canBeImported
    );
    const canImport =
      importableScreens.length > 0 || this.props.project.otherAssets.length > 0;
    const buttons = canImport ? (
      <Buttons>
        <Confirm
          onClick={() =>
            this.props.onImport(
              this.props.project.id,
              this.state.selectedScreens,
              this.state.selectedAssets
            )
          }
          disabled={this.props.isImporting}
        >
          {this.props.isImporting && <span className="fa fa-spin fa-spinner" />}
          {this.props.isImporting && ' '}
          Import
        </Confirm>
      </Buttons>
    ) : (
      <Buttons>
        <Cancel onClick={this.props.handleClose} />
      </Buttons>
    );

    return (
      <Dialog
        title={`Import from Project: ${this.props.project.name}`}
        soundPlayer={this.sounds}
        {...this.props}
      >
        <Body>
          <div style={styles.scrollable}>
            {importableScreens.length > 0 && (
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
              </MultiCheckboxSelector>
            )}
            {this.props.project.otherAssets.length > 0 && (
              <MultiCheckboxSelector
                style={styles.section}
                header="Other Assets"
                items={this.props.project.otherAssets}
                selected={this.state.selectedAssets}
                onChange={selectedAssets => this.setState({selectedAssets})}
                itemPropName="asset"
                disabled={this.props.isImporting}
              >
                <AssetListItem
                  projectId={this.props.project.id}
                  soundPlayer={this.sounds}
                />
              </MultiCheckboxSelector>
            )}
            {nonImportableScreens.length > 0 && (
              <div style={styles.section}>
                <h2 style={multiCheckboxStyles.header}>Cannot Import</h2>
                <p style={styles.subtext}>
                  Cannot import the following screens because they contain
                  design elements with IDs already used in your existing
                  project. Fix the IDs in either project so they aren't
                  duplicated across different screens before trying to import
                  the following.
                </p>
                <ul style={multiCheckboxStyles.list}>
                  {nonImportableScreens.map(screen => (
                    <li key={screen.id} style={multiCheckboxStyles.listItem}>
                      <ScreenListItem screen={screen} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Body>
        {buttons}
      </Dialog>
    );
  }
}

// TODO: ditch color and fontSize in favor of more unified style components when they exist.
const styles = {
  section: {
    marginTop: MARGIN * 2
  },
  warning: {
    color: color.red,
    fontSize: 'smaller',
    margin: 0
  },
  subtext: {
    color: color.black
  },
  screenListItem: {
    display: 'flex',
    alignItems: 'center',
    color: color.black
  },
  disabledScreenListItem: {
    color: color.light_gray
  },
  assetListItem: {
    display: 'flex',
    alignItems: 'center'
  },
  assetThumbnail: {
    margin: 0,
    height: ICON_HEIGHT,
    width: ICON_HEIGHT,
    color: color.black
  },
  assetThumbnailIcon: {
    fontSize: 25,
    margin: 0,
    lineHeight: '' + ICON_HEIGHT + 'px'
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
    marginRight: MARGIN
  },
  miniScreen: {
    display: 'inline-block',
    position: 'absolute',
    left: 0,
    transform: `scale(${SCALE})`,
    transformOrigin: 'top left',
    width: applabConstants.APP_WIDTH
  },
  checkbox: {
    marginRight: MARGIN
  },
  selectAllCheckbox: {
    marginRight: MARGIN,
    position: 'relative',
    bottom: 4
  },
  scrollable: {
    overflow: 'hidden',
    overflowY: 'scroll',
    maxHeight: '400px'
  }
};

export default connect(
  state => ({
    isOpen: !!(
      state.screens.isImportingScreen &&
      state.screens.importProject.fetchedProject
    ),
    project: state.screens.importProject.importableProject
  }),
  dispatch => ({
    onImport(projectId, screens, assets) {
      dispatch(importIntoProject(projectId, screens, assets));
    },
    handleClose() {
      dispatch(toggleImportScreen(false));
    }
  })
)(ImportScreensDialog);
