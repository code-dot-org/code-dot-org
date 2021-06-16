import $ from 'jquery';
import {Record} from 'immutable';

export default class UserPreferences extends Record({userId: 'me'}) {
  /**
   * Save the using_text_mode user preference
   * @param {boolean} usingTextMode - Whether or not the user should be in text mode.
   * @param {Object} [context] - additional information regarding the context in which this
   *        change is occuring. Only used for logging/analysis.
   * @param {string} [context.project_id] - id of the project the user is working on
   * @param {string} [context.level_id] - id of the level the user is working on
   */
  setUsingTextMode(usingTextMode, context = {}) {
    return $.post(`/api/v1/users/${this.userId}/using_text_mode`, {
      ...context,
      using_text_mode: usingTextMode
    });
  }

  getUsingTextMode() {
    return $.getJSON(`/api/v1/users/${this.userId}/using_text_mode`).then(
      response => response.using_text_mode
    );
  }

  /**
   * Save the display_mode user preference
   * @param {string} displayMode - display mode string.
   */
  setDisplayMode(displayMode) {
    return $.post(`/api/v1/users/${this.userId}/display_mode`, {
      display_mode: displayMode
    });
  }

  getDisplayMode() {
    return $.getJSON(`/api/v1/users/${this.userId}/display_mode`).then(
      response => response.display_mode
    );
  }
}
