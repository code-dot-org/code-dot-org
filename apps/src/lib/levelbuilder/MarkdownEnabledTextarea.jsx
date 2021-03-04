import PropTypes from 'prop-types';
import React from 'react';

import UploadImageDialog from './lesson-editor/UploadImageDialog';
import FindResourceDialog from './lesson-editor/FindResourceDialog';

const styles = {
  container: {
    flex: '1 1 500px',
    maxWidth: 970,
    margin: 5
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0
  },
  icon: {
    marginRight: 7
  }
};

export const markdownFeaturesShape = PropTypes.shape({
  imageUpload: PropTypes.bool,
  resourceLink: PropTypes.bool
});

export default class MarkdownEnabledTextarea extends React.Component {
  static propTypes = {
    markdown: PropTypes.string,
    name: PropTypes.string,
    inputRows: PropTypes.number,
    handleMarkdownChange: PropTypes.func.isRequired,
    features: markdownFeaturesShape
  };

  static defaultProps = {
    features: {}
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  changeMarkdown(newMarkdown) {
    let e = {target: {value: newMarkdown}};
    this.props.handleMarkdownChange(e);
  }

  handleOpenUploadImage = () => {
    this.setState({uploadImageOpen: true});
  };

  handleOpenAddResourceLink = () => {
    this.setState({addResourceLinkOpen: true});
  };

  handleCloseUploadImage = () => {
    this.setState({uploadImageOpen: false});
  };

  handleCloseAddResourceLink = () => {
    this.setState({addResourceLinkOpen: false});
  };

  handleConfirmAddResourceLink = resourceKey => {
    if (resourceKey) {
      this.changeMarkdown(this.props.markdown + `\n\n[r ${resourceKey}]`);
    }
    this.handleCloseAddResourceLink();
  };

  handleUploadImage = url => {
    this.changeMarkdown(this.props.markdown + `\n\n![](${url})`);
  };

  render() {
    return (
      <div>
        <div style={{margin: 5}}>
          <textarea
            name={this.props.name}
            onChange={this.props.handleMarkdownChange}
            rows={this.props.inputRows || 5}
            style={styles.input}
            value={this.props.markdown}
          />
          {this.props.features.imageUpload && (
            <button
              className="btn"
              onClick={this.handleOpenUploadImage}
              type="button"
            >
              <i style={styles.icon} className="fa fa-plus-circle" />
              Image
            </button>
          )}
          {this.props.features.resourceLink && (
            <button
              className="btn"
              onClick={this.handleOpenAddResourceLink}
              type="button"
            >
              <i style={styles.icon} className="fa fa-plus-circle" />
              Resource
            </button>
          )}
        </div>
        {this.props.features.imageUpload && (
          <UploadImageDialog
            handleClose={this.handleCloseUploadImage}
            isOpen={!!this.state.uploadImageOpen}
            uploadImage={this.handleUploadImage}
          />
        )}
        {this.props.features.resourceLink && (
          <FindResourceDialog
            handleClose={this.handleCloseAddResourceLink}
            handleConfirm={this.handleConfirmAddResourceLink}
            isOpen={!!this.state.addResourceLinkOpen}
          />
        )}
      </div>
    );
  }
}
