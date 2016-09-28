/** @file JavaScript run only on the /s/:script_name/edit page. */
/* globals i18nData */

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Component for editing course scripts.
 */
var ScriptEditor = React.createClass({
  propTypes: {
    i18nData: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <form>
        <label>Title <input defaultValue={this.props.i18nData.title} /></label>
        <label>Short Description <input defaultValue={this.props.i18nData.descriptionShort} /></label>
        <label>Description <textarea defaultValue={this.props.i18nData.description} /></label>
        <label>Audience <input defaultValue={this.props.i18nData.descriptionAudience} /></label>
      </form>
    );
  }
});

ReactDOM.render(
  <ScriptEditor i18nData={i18nData} />,
  document.querySelector('.edit_container')
);
