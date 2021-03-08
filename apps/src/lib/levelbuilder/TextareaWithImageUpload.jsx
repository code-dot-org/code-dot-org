import PropTypes from 'prop-types';
import React from 'react';
import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';

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
  }
};

/**
 * Component for previewing Markdown for a edit field
 */
export default class TextareaWithImageUpload extends React.Component {
  static propTypes = {
    markdown: PropTypes.string,
    name: PropTypes.string,
    inputRows: PropTypes.number,
    handleMarkdownChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      uploadImageOpen: false
    };
  }

  handleOpenUploadImage = () => {
    this.setState({uploadImageOpen: true});
  };

  handleCloseUploadImage = () => {
    this.setState({uploadImageOpen: false});
  };

  handleUploadImage = (url, expandable) => {
    const param = expandable ? 'expandable' : '';
    const e = {
      target: {value: this.props.markdown + `\n\n![${param}](${url})`}
    };
    this.props.handleMarkdownChange(e);
  };

  render() {
    return (
      <div>
        <div style={{margin: 5}}>
          <textarea
            name={this.props.name}
            value={this.props.markdown}
            rows={this.props.inputRows || 5}
            style={styles.input}
            onChange={this.props.handleMarkdownChange}
          />
          <button
            onMouseDown={this.handleOpenUploadImage}
            className="btn"
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Image
          </button>
        </div>
        <UploadImageDialog
          isOpen={this.state.uploadImageOpen}
          handleClose={this.handleCloseUploadImage}
          uploadImage={this.handleUploadImage}
        />
      </div>
    );
  }
}
