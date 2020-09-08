import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';

const styles = {
  box: {
    marginTop: 10,
    marginBottom: 10,
    border: '1px solid ' + color.light_gray,
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
  },
  label: {
    fontWeight: 'bold'
  }
};

/**
 * Component for previewing Markdown for a edit field
 */
export default class MarkdownPreview extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    inputRows: PropTypes.number
  };

  render() {
    return (
      <label>
        <span style={styles.label}>{this.props.label}</span>
        <div style={styles.box}>
          <div style={{marginBottom: 5}}>Markdown:</div>
          <textarea
            name={this.props.name}
            defaultValue={this.props.markdown}
            rows={this.props.inputRows || 5}
            style={styles.input}
            onChange={this.props.onChange}
          />
          <div style={{marginBottom: 5}}>Preview:</div>
          <div style={styles.box}>
            <SafeMarkdown
              openExternalLinksInNewTab={true}
              markdown={this.props.markdown}
            />
          </div>
        </div>
      </label>
    );
  }
}
