import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectUpdatedAt from './ProjectUpdatedAt';
import {
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  setProjectUpdatedSaved
} from '../../headerRedux';

// Levelbuilder-only UI for saving changes to a level.
class LevelBuilderSaveButton extends React.Component {
  static propTypes = {
    getChanges: PropTypes.func.isRequired,
    setProjectUpdatedError: PropTypes.func.isRequired,
    setProjectUpdatedSaving: PropTypes.func.isRequired,
    setProjectUpdatedSaved: PropTypes.func.isRequired,
    overrideHeaderText: PropTypes.string,
    overrideOnSaveURL: PropTypes.string
  };

  onSave = () => {
    this.props.setProjectUpdatedSaving();

    $.ajax({
      type: 'POST',
      url: this.props.overrideOnSaveURL || '../update_start_code',
      data: JSON.stringify(this.props.getChanges()),
      dataType: 'json',
      error: this.props.setProjectUpdatedError,
      success: this.props.setProjectUpdatedSaved,
      contentType: 'application/json'
    });
  };

  render() {
    return (
      <div style={{display: 'flex'}}>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">
            {this.props.overrideHeaderText || 'Levelbuilder: edit start code'}
          </div>
          <ProjectUpdatedAt />
        </div>
        <div className="project_remix header_button" onClick={this.onSave}>
          Save
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    getChanges: state.header.getLevelBuilderChanges,
    overrideHeaderText: state.header.overrideHeaderText,
    overrideOnSaveURL: state.header.overrideOnSaveURL
  }),
  {
    setProjectUpdatedError,
    setProjectUpdatedSaving,
    setProjectUpdatedSaved
  }
)(LevelBuilderSaveButton);
