import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import experiments from '../../util/experiments';
import LibraryCategory from '../dataBrowser/LibraryCategory';

const styles = {
  warning: {
    color: '#9F6000',
    backgroundColor: color.lighter_yellow,
    padding: 10,
    fontSize: 14
  },
  error: {
    color: color.red,
    backgroundColor: color.lightest_red,
    padding: 10,
    fontSize: 14
  }
};

class ManifestEditor extends React.Component {
  static propTypes = {
    // Provided via Redux
    libraryManifest: PropTypes.object.isRequired
  };

  state = {
    showUnpublishedTables: false
  };

  componentDidMount() {
    this.setState({
      showUnpublishedTables: experiments.isEnabled(
        experiments.SHOW_UNPUBLISHED_FIREBASE_TABLES
      )
    });
  }

  render() {
    const isValidJson =
      this.props.libraryManifest.categories &&
      this.props.libraryManifest.tables;

    const categories = (this.props.libraryManifest.categories || []).filter(
      category => this.state.showUnpublishedTables || category.published
    );
    return (
      <div>
        <h1>Edit Dataset Manifest </h1>
        <h2>Library Preview</h2>
        {this.state.showUnpublishedTables && (
          <p style={styles.warning}>
            Note: Showing unpublished categories and tables because you have the
            showUnpublishedFirebaseTables experiment enabled.
            <br />
            <a
              href={
                location.href +
                '?disableExperiments=showUnpublishedFirebaseTables'
              }
            >
              Click here to turn off the experiment.
            </a>
          </p>
        )}
        {isValidJson ? (
          categories.map(category => (
            <LibraryCategory
              key={category.name}
              name={category.name}
              datasets={category.datasets}
              description={category.description}
              importTable={() => {}} // No-op for preview only
            />
          ))
        ) : (
          <p style={styles.error}>Invalid JSON</p>
        )}
        <h2>Manifest JSON</h2>
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
