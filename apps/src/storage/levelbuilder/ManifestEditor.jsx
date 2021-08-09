import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';
import Button from '@cdo/apps/templates/Button';
import LibraryCategory from '../dataBrowser/LibraryCategory';

class ManifestEditor extends React.Component {
  static propTypes = {
    // Provided via Redux
    libraryManifest: PropTypes.object.isRequired
  };

  state = {
    showUnpublishedTables: false,
    notice: null,
    isError: false
  };

  displayNotice = (notice, isError) => {
    this.setState({notice, isError}, () =>
      setTimeout(() => this.setState({notice: null, isError: false}), 5000)
    );
    window.scrollTo(0, 0);
  };

  handleSubmit = event => {
    $.ajax({
      url: '/datasets/manifest/update',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({manifest: this.refs.content.value})
    })
      .done(() => this.displayNotice('Manifest Saved', false))
      .fail(err => this.displayNotice(`Error: ${err.statusText}`, true));
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
        {this.state.notice && (
          <p style={this.state.isError ? styles.error : styles.success}>
            {this.state.notice}
          </p>
        )}
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
        <Button
          __useDeprecatedTag
          text="Submit"
          onClick={this.handleSubmit}
          disabled={!isValidJson}
          color={Button.ButtonColor.blue}
          size={Button.ButtonSize.large}
          style={styles.submit}
        />
      </div>
    );
  }
}

const styles = {
  error: {
    color: color.red,
    backgroundColor: color.lightest_red,
    padding: 10,
    fontSize: 14
  },
  submit: {
    marginTop: 15
  },
  success: {
    color: color.realgreen,
    backgroundColor: color.lighter_green,
    padding: 10,
    fontSize: 14
  },
  warning: {
    color: '#9F6000',
    backgroundColor: color.lighter_yellow,
    padding: 10,
    fontSize: 14
  }
};

export default connect(
  state => ({libraryManifest: state.data.libraryManifest || {}}),
  dispatch => ({})
)(ManifestEditor);
