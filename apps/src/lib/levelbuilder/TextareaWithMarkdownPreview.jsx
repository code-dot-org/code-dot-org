import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import TextareaWithImageUpload from '@cdo/apps/lib/levelbuilder/TextareaWithImageUpload';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

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
            <TextareaWithImageUpload
              markdown={this.props.markdown}
              name={this.props.name}
              inputRows={this.props.inputRows || 5}
              handleMarkdownChange={this.props.handleMarkdownChange}
            />
          </div>
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
      </label>
    );
  }
}
