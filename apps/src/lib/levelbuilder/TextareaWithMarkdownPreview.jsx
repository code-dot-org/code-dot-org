import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';

const styles = {
  wrapper: {
    marginTop: 10,
    marginBottom: 10,
    border: '1px solid ' + color.light_gray,
    padding: 5,
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  container: {
    flex: '1 1 500px',
    maxWidth: 970,
    margin: 5
  },
  preview: {
    marginTop: 5,
    marginBottom: 0,
    border: '1px solid ' + color.lighter_gray,
    padding: 10
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
export default class TextareaWithMarkdownPreview extends React.Component {
  static propTypes = {
    markdown: PropTypes.string,
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    inputRows: PropTypes.number,
    helpTip: PropTypes.string,
    handleMarkdownChange: PropTypes.func.isRequired,
    hidePreview: PropTypes.bool
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

  handleUploadImage = url => {
    let e = {target: {value: this.props.markdown + `\n\n![](${url})`}};
    this.props.handleMarkdownChange(e);
  };

  render() {
    return (
      <label>
        {this.props.label}
        {this.props.helpTip && (
          <HelpTip>
            <p>{this.props.helpTip}</p>
          </HelpTip>
        )}
        <div style={styles.wrapper}>
          <div style={styles.container}>
            <div style={{marginBottom: 5}}>Markdown:</div>
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
              style={styles.addButton}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Image
            </button>
          </div>
          {!this.props.hidePreview && (
            <div style={styles.container}>
              <div style={{marginBottom: 5}}>Preview:</div>
              <div style={styles.preview}>
                <SafeMarkdown
                  openExternalLinksInNewTab={true}
                  markdown={this.props.markdown}
                />
              </div>
            </div>
          )}
        </div>
        <UploadImageDialog
          isOpen={this.state.uploadImageOpen}
          handleClose={this.handleCloseUploadImage}
          uploadImage={this.handleUploadImage}
        />
      </label>
    );
  }
}
