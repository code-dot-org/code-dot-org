/** @file JavaScript run only on the /s/:script_name/edit page. */
/* globals i18nData */

import React from 'react';
import ReactDOM from 'react-dom';

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4
  }
};

/**
 * Component for editing course scripts.
 */
var ScriptEditor = React.createClass({
  propTypes: {
    i18nData: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <div>
        <label>
          Title
          <input
            name="title"
            defaultValue={this.props.i18nData.title}
            style={styles.input}
          />
        </label>
        <label>
          Audience
          <input
            name="description_audience"
            defaultValue={this.props.i18nData.descriptionAudience}
            style={styles.input}
          />
        </label>
        <label>
          Short Description
          <input
            name="description_short"
            defaultValue={this.props.i18nData.descriptionShort}
            style={styles.input}
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            defaultValue={this.props.i18nData.description}
            rows={5}
            style={styles.input}
          />
        </label>
      </div>
    );
  }
});

ReactDOM.render(
  <ScriptEditor i18nData={i18nData} />,
  document.querySelector('.edit_container')
);
