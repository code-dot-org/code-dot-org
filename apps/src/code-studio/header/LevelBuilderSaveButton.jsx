import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

const statuses = {
  default: 'Not saved',
  saving: 'Saving ...',
  saved: 'Saved',
  error: 'Error saving project'
};

// Levelbuilder-only UI for saving changes to a level.
class LevelBuilderSaveButton extends React.Component {
  static propTypes = {
    getChanges: PropTypes.func.isRequired
  };

  state = {
    status: statuses.default
  };

  saveStartCode = () => {
    this.setState({
      status: statuses.SAVING
    });

    $.ajax({
      type: 'POST',
      url: '../update_properties',
      data: JSON.stringify(this.props.getChanges()),
      dataType: 'json',
      error: () => {
        this.setState({
          status: statuses.error
        });
      },
      success: () => {
        this.setState({
          status: statuses.saved
        });
      }
    });
  };

  render() {
    return (
      <div>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">
            Levelbuilder: edit start code
          </div>
          <div className="project_updated_at header_text">
            {this.state.status}
          </div>
        </div>
        <div
          className="project_remix header_button"
          onClick={this.saveStartCode}
        >
          Save
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  getChanges: state.header.getLevelBuilderChanges
}))(LevelBuilderSaveButton);
