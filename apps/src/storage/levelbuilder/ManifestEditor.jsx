import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

class ManifestEditor extends React.Component {
  static propTypes = {
    // Provided via Redux
    libraryManifest: PropTypes.object.isRequired
  };

  render() {
    return (
      <div>
        <h1>Edit Dataset Manifest </h1>
        <textarea
          ref="content"
          // 3rd parameter specifies number of spaces to insert into the output JSON string for readability purposes.
          // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
          value={JSON.stringify(this.props.libraryManifest, null, 2)}
          // Change handler is required for this element, but changes will be handled by the code mirror.
          onChange={() => {}}
        />
      </div>
    );
  }
}

export default connect(
  state => ({libraryManifest: state.data.libraryManifest || {}}),
  dispatch => ({})
)(ManifestEditor);
