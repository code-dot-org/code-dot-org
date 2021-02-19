import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import TextareaWithImageUpload from '@cdo/apps/lib/levelbuilder/TextareaWithImageUpload';

const styles = {
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
    handleMarkdownChange: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <TextareaWithImageUpload
          markdown={this.props.markdown}
          label={this.props.label}
          name={this.props.name}
          inputRows={this.props.inputRows}
          helpTip={this.props.helpTip}
          handleMarkdownChange={this.props.handleMarkdownChange}
        />
        <div style={styles.container}>
          <div style={{marginBottom: 5}}>Preview:</div>
          <div style={styles.preview}>
            <SafeMarkdown
              openExternalLinksInNewTab={true}
              markdown={this.props.markdown}
            />
          </div>
        </div>
      </div>
    );
  }
}
