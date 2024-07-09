import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';

import loadable from '@cdo/apps/util/loadable';

const VirtualizedSelect = loadable(() =>
  import('@cdo/apps/templates/VirtualizedSelect')
);
import SingleCheckbox from '../../../form_components/SingleCheckbox';
import {getLatestVersionMap} from '../../foormHelpers';
import {
  setLastSaved,
  setSaveError,
  setHasJSONError,
  setHasLintError,
  setLastSavedQuestions,
} from '../foormEditorRedux';

class FoormEntityLoadButtons extends React.Component {
  static propTypes = {
    resetCodeMirror: PropTypes.func,
    resetSelectedData: PropTypes.func,
    onSelect: PropTypes.func,
    foormEntities: PropTypes.array,
    foormEntityName: PropTypes.string,
    showCodeMirror: PropTypes.func,
    isDisabled: PropTypes.bool,
    showVersionFilterToggle: PropTypes.bool,

    // populated by redux
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setHasJSONError: PropTypes.func,
    setHasLintError: PropTypes.func,
    setLastSavedQuestions: PropTypes.func,
  };

  state = {
    latestVersionsOnly: true,
    selectedOption: null,
  };

  shouldShowLatestVersionsOnly() {
    return this.props.showVersionFilterToggle && this.state.latestVersionsOnly;
  }

  /**
   * Takes props.foormEntities in the form of {metatadata: {name: string, version: number}, text: string}
   * and optionally sorts and filters (based on version filter toggle) and renders them as MenuItems.
   * @returns Array<MenuItem>
   */
  getDropdownOptions() {
    const latestVersionMap = getLatestVersionMap(this.props.foormEntities);

    return (
      this.props.foormEntities
        // optionally filter out entities without the latest version of a name
        .filter(entity =>
          this.shouldShowLatestVersionsOnly()
            ? latestVersionMap[entity['metadata']['name']] ===
              entity['metadata']['version']
            : true
        )
        // sort entities alphabetically by name and version (sort numerically when names are the same)
        .sort(
          (a, b) =>
            a['text'].localeCompare(b['text']) ||
            a['metadata']['version'] - b['metadata']['version']
        )
        .map(entity => {
          return {metadata: entity['metadata'], label: entity['text']};
        })
    );
  }

  initializeEmptyCodeMirror() {
    this.props.resetSelectedData();
    this.props.showCodeMirror();
    this.props.resetCodeMirror({});

    // From redux store
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    this.props.setHasJSONError(false);
    this.props.setHasLintError(false);
    this.props.setLastSavedQuestions({});
  }

  render() {
    return (
      <div>
        <div className="load-buttons-top-row">
          <VirtualizedSelect
            options={this.getDropdownOptions()}
            className="load-buttons-search"
            cache={false}
            value={this.state.selectedOption}
            onChange={option => {
              this.setState({selectedOption: option});
              if (option) {
                this.props.onSelect(option.metadata);
              }
            }}
            placeholder={`Search for ${this.props.foormEntityName}`}
          />
          <Button
            onClick={() => this.initializeEmptyCodeMirror()}
            className="load-buttons-new"
            disabled={this.props.isDisabled}
          >
            {`New ${this.props.foormEntityName}`}
          </Button>
        </div>
        {this.props.showVersionFilterToggle && (
          <SingleCheckbox
            name="latestVersionsOnly"
            label="Only show latest version"
            onChange={() =>
              this.setState({
                latestVersionsOnly: !this.state.latestVersionsOnly,
              })
            }
            value={this.state.latestVersionsOnly}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedFoormEntityLoadButtons = FoormEntityLoadButtons;

export default connect(null, dispatch => ({
  setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
  setSaveError: saveError => dispatch(setSaveError(saveError)),
  setHasJSONError: hasJSONError => dispatch(setHasJSONError(hasJSONError)),
  setHasLintError: hasLintError => dispatch(setHasLintError(hasLintError)),
  setLastSavedQuestions: questions =>
    dispatch(setLastSavedQuestions(questions)),
}))(FoormEntityLoadButtons);
