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
  }
};

/**
 * Component for previewing Markdown for a edit field
 */
export default class MarkdownPreview extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired
  };

  render() {
    return (
      <div>
        <div style={{marginBottom: 5}}>Preview:</div>
        <div style={styles.box}>
          <SafeMarkdown
            openExternalLinksInNewTab={true}
            markdown={this.props.markdown}
          />
        </div>
      </div>
    );
  }
}
