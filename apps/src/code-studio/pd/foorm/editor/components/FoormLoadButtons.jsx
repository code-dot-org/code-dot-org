import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import {
  setLastSaved,
  setSaveError,
  setHasJSONError,
  setLastSavedQuestions
} from '../foormEditorRedux';

function FoormLoadButtons(props) {
  return (
    <div>
      <DropdownButton id="load_config" title="Load Form..." className="btn">
        {getFormattedConfigurationDropdownOptions(
          props.dropdownOptions,
          props.onSelect
        )}
      </DropdownButton>
      <Button onClick={() => initializeEmptyCodeMirror(props)} className="btn">
        New Form
      </Button>
    </div>
  );
}

function initializeEmptyCodeMirror(props) {
  props.resetSelectedData();
  props.showCodeMirror();
  props.resetCodeMirror({});

  // Reset redux store
  props.setLastSaved(null);
  props.setSaveError(null);
  props.setHasJSONError(false);
  props.setLastSavedQuestions({});
}

function renderMenuItem(clickHandler, textToDisplay, key) {
  return (
    <MenuItem key={key} eventKey={key} onClick={clickHandler}>
      {textToDisplay}
    </MenuItem>
  );
}

function getFormattedConfigurationDropdownOptions(dropdownOptions, onSelect) {
  return dropdownOptions.map((dropdownOption, i) => {
    return renderMenuItem(
      () => onSelect(dropdownOption['id']),
      dropdownOption['text'],
      i
    );
  });
}

FoormLoadButtons.propTypes = {
  resetCodeMirror: PropTypes.func,
  namesAndVersions: PropTypes.array,
  resetSelectedData: PropTypes.func,
  onSelect: PropTypes.func,
  dropdownOptions: PropTypes.array,
  showCodeMirror: PropTypes.func,

  // populated by redux
  setLastSaved: PropTypes.func,
  setSaveError: PropTypes.func,
  setHasJSONError: PropTypes.func,
  setLastSavedQuestions: PropTypes.func
};

export default connect(
  null,
  dispatch => ({
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setHasJSONError: hasJSONError => dispatch(setHasJSONError(hasJSONError)),
    setLastSavedQuestions: questions =>
      dispatch(setLastSavedQuestions(questions))
  })
)(FoormLoadButtons);
