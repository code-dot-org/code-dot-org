import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import SingleCheckbox from '../../../form_components/SingleCheckbox';
import {
  setLastSaved,
  setSaveError,
  setHasJSONError,
  setHasLintError,
  setLastSavedQuestions
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

    // populated by redux
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setHasJSONError: PropTypes.func,
    setHasLintError: PropTypes.func,
    setLastSavedQuestions: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      latestVersionsOnly: false
    };
  }

  getDropdownOptions() {
    return (
      this.props.foormEntities
        // sort entities alphabetically by name and version
        .sort((a, b) => a['text'].localeCompare(b['text']))
        // optionally filter out entities so that only the last unique version of a name remains
        .filter((entity, i, array) =>
          this.state.latestVersionsOnly && array[i + 1]
            ? array[i + 1]['metadata']['name'] !== entity['metadata']['name']
            : true
        )
        .map((entity, i) => {
          return this.renderMenuItem(
            () => this.props.onSelect(entity['metadata']),
            entity['text'],
            i
          );
        })
    );
  }

  renderMenuItem(clickHandler, textToDisplay, key) {
    return (
      <MenuItem key={key} eventKey={key} onClick={clickHandler}>
        {textToDisplay}
      </MenuItem>
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
        <DropdownButton
          id="load_config"
          title={`Load ${this.props.foormEntityName}...`}
          className="btn"
          disabled={this.props.isDisabled}
        >
          {this.getDropdownOptions()}
        </DropdownButton>
        <Button
          onClick={() => this.initializeEmptyCodeMirror()}
          className="btn"
          disabled={this.props.isDisabled}
        >
          {`New ${this.props.foormEntityName}`}
        </Button>
        <SingleCheckbox
          name="latestVersionsOnly"
          label="Only show latest version"
          onChange={() =>
            this.setState({
              latestVersionsOnly: !this.state.latestVersionsOnly
            })
          }
          value={this.state.latestVersionsOnly}
        />
      </div>
    );
  }
}

export const UnconnectedFoormEntityLoadButtons = FoormEntityLoadButtons;

export default connect(
  null,
  dispatch => ({
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setHasJSONError: hasJSONError => dispatch(setHasJSONError(hasJSONError)),
    setHasLintError: hasLintError => dispatch(setHasLintError(hasLintError)),
    setLastSavedQuestions: questions =>
      dispatch(setLastSavedQuestions(questions))
  })
)(FoormEntityLoadButtons);
