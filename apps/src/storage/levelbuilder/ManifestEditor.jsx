import $ from 'jquery';
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import LibraryCategory from '../dataBrowser/LibraryCategory';

const styles = {
  submit: {
    marginTop: '15px'
  },
  successNotice: {
    color: color.realgreen,
    backgroundColor: color.lighter_green,
    padding: 10,
    fontSize: 14
  },
  errorNotice: {
    color: color.red,
    backgroundColor: color.lightest_red,
    padding: 10,
    fontSize: 14
  }
};

class ManifestEditor extends React.Component {
  static propTypes = {
    libraryManifest: PropTypes.object.isRequired
  };

  state = {
    notice: '',
    isError: false
  };

  displayNotice = (notice, isError) => {
    this.setState({notice: notice, isError: isError}, () =>
      setTimeout(() => this.setState({notice: '', isError: false}), 5000)
    );
    window.scrollTo(0, 0);
  };

  handleSubmit = event => {
    $.ajax({
      url: '/datasets/manifest',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({manifest: this.refs.content.value})
    })
      .done(data => {
        this.displayNotice('Manifest Saved!', false);
      })
      .fail((jqXhr, status) => {
        this.displayNotice('Error', true);
      });
  };

  render() {
    const isValidJson =
      this.props.libraryManifest.categories &&
      this.props.libraryManifest.tables;
    return (
      <div>
        {this.state.notice && (
          <p
            style={
              this.state.isError ? styles.errorNotice : styles.successNotice
            }
          >
            {this.state.notice}
          </p>
        )}
        <h1>Edit Dataset Manifest</h1>
        <h2>Preview</h2>
        {isValidJson ? (
          this.props.libraryManifest.categories.map(category => (
            <LibraryCategory
              key={category.name}
              name={category.name}
              datasets={category.datasets}
              description={category.description}
              importTable={() => {}}
            />
          ))
        ) : (
          <p style={styles.errorNotice}>Invalid JSON</p>
        )}
        <h2>Manifest JSON</h2>
        <textarea
          id="content"
          ref="content"
          value={JSON.stringify(this.props.libraryManifest, null, 2)}
          // Change handler is required for this element, but changes are actually handled by the code mirror
          onChange={() => {}}
        />
        <Button
          text={'Submit'}
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

export default connect(
  state => ({
    libraryManifest: state.data.libraryManifest || {}
  }),
  dispatch => ({})
)(ManifestEditor);
