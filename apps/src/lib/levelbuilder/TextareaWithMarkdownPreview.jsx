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
  }
};

/**
 * Component for previewing Markdown for a edit field
 */
export default class TextareaWithMarkdownPreview extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    inputRows: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.state = {
      markdown: this.props.markdown
    };
  }

  handleMarkdownChange = event => {
    this.setState({markdown: event.target.value});
  };

  render() {
    return (
      <label>
        {this.props.label}
        <div style={styles.box}>
          <div style={{marginBottom: 5}}>Markdown:</div>
          <textarea
            name={this.props.name}
            defaultValue={this.state.markdown}
            rows={this.props.inputRows || 5}
            style={styles.input}
            onChange={this.handleMarkdownChange}
          />
          <div style={{marginBottom: 5}}>Preview:</div>
          <div style={styles.box}>
            <SafeMarkdown
              openExternalLinksInNewTab={true}
              markdown={this.state.markdown}
            />
          </div>
        </div>
      </label>
    );
  }
}
