import PropTypes from 'prop-types';
import React from 'react';

import {buildProgrammingExpressionMarkdown} from '@cdo/apps/templates/lessonOverview/StyledCodeBlock';

import UploadImageDialog from './lesson-editor/UploadImageDialog';
import FindResourceDialog from './lesson-editor/FindResourceDialog';
import FindProgrammingExpressionDialog from './lesson-editor/FindProgrammingExpressionDialog';

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

  handleOpenAddProgrammingExpression = () => {
    this.setState({addProgrammingExpressionOpen: true});
  };

  handleCloseUploadImage = () => {
    this.setState({uploadImageOpen: false});
  };

  handleCloseAddResourceLink = () => {
    this.setState({addResourceLinkOpen: false});
  };

  handleCloseAddProgrammingExpression = () => {
    this.setState({addProgrammingExpressionOpen: false});
  };

  handleConfirmAddResourceLink = resourceKey => {
    if (resourceKey) {
      this.changeMarkdown(this.props.markdown + `\n\n[r ${resourceKey}]`);
    }
    this.handleCloseAddResourceLink();
  };

  handleUploadImage = (url, expandable) => {
    const param = expandable ? 'expandable' : '';
    this.changeMarkdown(this.props.markdown + `\n\n![${param}](${url})`);
  };

  handleAddProgrammingExpression = programmingExpression => {
    if (programmingExpression) {
      this.changeMarkdown(
        this.props.markdown +
          buildProgrammingExpressionMarkdown(programmingExpression)
      );
    }
    this.handleCloseAddProgrammingExpression();
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
          <div className="btn-toolbar">
            <div className="btn-group">
              <span className="btn dropdown-toggle" data-toggle="dropdown">
                Add&hellip; <span className="caret" />
              </span>
              <ul className="dropdown-menu">
                {this.props.features.imageUpload && (
                  <li>
                    <a onClick={this.handleOpenUploadImage}>Image</a>
                  </li>
                )}
                {this.props.features.resourceLink && (
                  <li>
                    <a onClick={this.handleOpenAddResourceLink}>Resource</a>
                  </li>
                )}
                {this.props.features.programmingExpression && (
                  <li>
                    <a onClick={this.handleOpenAddProgrammingExpression}>
                      Code Block
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
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
        {this.props.features.programmingExpression && (
          <FindProgrammingExpressionDialog
            handleClose={this.handleCloseAddProgrammingExpression}
            handleConfirm={this.handleAddProgrammingExpression}
            isOpen={!!this.state.addProgrammingExpressionOpen}
          />
        )}
      </div>
    );
  }
}

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
