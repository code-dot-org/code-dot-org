import {Record} from 'immutable';
import $ from 'jquery';

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
      using_text_mode: usingTextMode,
    });
  }

  getUsingTextMode() {
    return $.getJSON(`/api/v1/users/${this.userId}/using_text_mode`).then(
      response => response.using_text_mode
    );
  }

  /**
   * Save the display_theme user preference
   * @param {string} displayTheme - display mode string.
   */
  setDisplayTheme(displayTheme) {
    return $.post(`/api/v1/users/${this.userId}/display_theme`, {
      display_theme: displayTheme,
    });
  }

  getDisplayTheme() {
    return $.getJSON(`/api/v1/users/${this.userId}/display_theme`).then(
      response => response.display_theme
    );
  }

  /**
   * Save the student list sorting preference
   * @param {boolean} sortByFamilyName: True if sorting by family name, false otherwise.
   */
  setSortByFamilyName(sortByFamilyName) {
    return $.post(`/api/v1/users/sort_by_family_name`, {
      sort_by_family_name: sortByFamilyName,
    });
  }

  /**
   * Save the preference to show v1 or v2 progress table.
   * @param {boolean} showProgressTableV2: True if showing progress table v2, false otherwise.
   */
  setShowProgressTableV2(showProgressTableV2) {
    return $.post(`/api/v1/users/show_progress_table_v2`, {
      show_progress_table_v2: showProgressTableV2,
    });
  }

  /**
   * Save the preference to opt-out of AI Rubrics (AI TA).
   * @param {boolean} aiRubricsDisabled: True if disabling AI rubric features, false otherwise.
   */
  setAiRubricsDisabled(aiRubricsDisabled) {
    return $.post(`/api/v1/users/ai_rubrics_disabled`, {
      ai_rubrics_disabled: aiRubricsDisabled,
    });
  }

  /**
   * Save the background music user preference
   * @param {boolean} muteMusic: True if background music muted
   */
  setMuteMusic(muteMusic) {
    return $.post(`/api/v1/users/${this.userId}/mute_music`, {
      mute_music: muteMusic,
    });
  }

  getMuteMusic() {
    return $.getJSON(`/api/v1/users/${this.userId}/mute_music`).then(
      response => response.mute_music
    );
  }
}
