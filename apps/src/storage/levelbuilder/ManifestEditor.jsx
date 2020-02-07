import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LibraryCategory from '../dataBrowser/LibraryCategory';

const styles = {
  warning: {
    color: '#c00',
    fontSize: 13,
    fontWeight: 'bold'
  }
};

class ManifestEditor extends React.Component {
  static propTypes = {
    libraryManifest: PropTypes.object.isRequired
  };

  render() {
    if (
      !this.props.libraryManifest.categories ||
      !this.props.libraryManifest.tables
    ) {
      return <p style={styles.warning}>Invalid JSON</p>;
    }
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
