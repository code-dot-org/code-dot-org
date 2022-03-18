import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

// do we want to skip all of these since no save to s3?
import ProjectUpdatedAt from './ProjectUpdatedAt';
import {
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  setProjectUpdatedSaved
} from '../../headerRedux';

// Levelbuilder-only UI for saving changes to a level.
class LevelBuilderSaveExemplarButton extends React.Component {
  static propTypes = {
    getChanges: PropTypes.func.isRequired,
    setProjectUpdatedError: PropTypes.func.isRequired,
    setProjectUpdatedSaving: PropTypes.func.isRequired,
    setProjectUpdatedSaved: PropTypes.func.isRequired
  };

  saveExemplar = () => {
    console.log('success!');
    // this.props.setProjectUpdatedSaving();
    //
    // $.ajax({
    //   type: 'POST',
    //   url: '../update_start_code',
    //   data: JSON.stringify(this.props.getChanges()),
    //   dataType: 'json',
    //   error: this.props.setProjectUpdatedError,
    //   success: this.props.setProjectUpdatedSaved,
    //   contentType: 'application/json'
    // });
  };

  render() {
    return (
      <div style={{display: 'flex'}}>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">
            Levelbuilder: edit exemplar
          </div>
          <ProjectUpdatedAt />
        </div>
        <div
          className="project_remix header_button"
          onClick={this.saveExemplar}
        >
          Save
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    getChanges: state.header.getLevelBuilderChanges
  }),
  {
    setProjectUpdatedError,
    setProjectUpdatedSaving,
    setProjectUpdatedSaved
  }
)(LevelBuilderSaveExemplarButton);
