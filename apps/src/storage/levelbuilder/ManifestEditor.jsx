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
          id="content"
          ref="content"
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
