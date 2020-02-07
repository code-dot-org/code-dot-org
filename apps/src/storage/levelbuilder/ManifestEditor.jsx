import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LibraryCategory from '../dataBrowser/LibraryCategory';

class ManifestEditor extends React.Component {
  static propTypes = {
    libraryManifest: PropTypes.object.isRequired
  };

  render() {
    return (
      <div>
        {this.props.libraryManifest.categories.map(category => (
          <LibraryCategory
            key={category.name}
            name={category.name}
            datasets={category.datasets}
            description={category.description}
            importTable={() => {}}
          />
        ))}
      </div>
    );
  }
}

export default connect(
  state => ({
    libraryManifest: state.data.libraryManifest || {}
  }),
  dispatch => ({})
)(ManifestEditor);
