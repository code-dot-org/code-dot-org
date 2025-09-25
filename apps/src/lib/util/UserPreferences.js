import {Record} from 'immutable';
import $ from 'jquery';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import HttpClient from '@cdo/apps/util/HttpClient';
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
   * @param {string} showProgressTableV2: 'v2' if showing progress table v2, 'legacy' if showing v1.
   */
  setShowProgressTableV2(showProgressTableV2) {
    return $.post(`/api/v1/users/show_progress_table_v2`, {
      show_progress_table_v2: showProgressTableV2,
    });
  }

  /**
   * Save whether the user has already seen the Welcome Popup for teacher homepage v2.
   * @param {boolean} hasSeenHomepageWelcome: True if the user has seen the welcome, false otherwise.
   */
  setHasSeenProgressTableInvite(hasSeenHomepageWelcome) {
    return $.post(`/api/v1/users/has_seen_homepage_welcome`, {
      has_seen_homepage_welcome: hasSeenHomepageWelcome,
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

  setAiDifferentiationEnabled(aiDifferentiationEnabled) {
    return $.post(`/api/v1/users/ai_differentiation_enabled`, {
      ai_differentiation_enabled: aiDifferentiationEnabled,
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

  /**
   * Save the user's font size selection for the console or editor.
   * @param {string} fontSize
   * @param {string} appName
   * @param {string} field either 'consoleFontSize' or 'editorFontSize'
   */
  setFontSize(fontSize, appName, field) {
    const body = {
      [field]: {
        [appName]: fontSize,
      },
    };

    HttpClient.put('/user_preference', JSON.stringify(body), true, {
      'Content-Type': 'application/json',
    });
  }

  /**
   * Fetch the user's console font size selection.
   * @param {string} appName
   */
  async getConsoleFontSize(appName) {
    try {
      const consoleFontSizeResponse = await HttpClient.fetchJson(
        '/user_preference/font_size/console'
      );
      const consoleFontSize =
        consoleFontSizeResponse.value.console_font_size[appName];
      return consoleFontSize;
    } catch (error) {
      // Don't log error if console font size for 'Not found'.
      // User did not save preferred console font size yet.
      if (error.response.status !== 404) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Error fetching console font size', undefined, {
            message: error.response,
          });
      }
      return null;
    }
  }

  /**
   * Fetch the user's editor font size selection.
   * @param {string} appName
   */
  async getEditorFontSize(appName) {
    try {
      const editorFontSizeResponse = await HttpClient.fetchJson(
        '/user_preference/font_size/editor'
      );
      const editorFontSize =
        editorFontSizeResponse.value.editor_font_size[appName];
      return editorFontSize;
    } catch (error) {
      // Don't log error if editor font size for 'Not found'.
      // User did not save preferred editor font size yet.
      if (error.response.status !== 404) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Error fetching editor font size', undefined, {
            message: error.response,
          });
      }
      return null;
    }
  }

  /**
   * Fetches all user theme settings (e.g., global, blockly).
   * @param {function} [errorCallback]
   */
  async getThemeSettings(errorCallback) {
    try {
      const themeResponse = await HttpClient.fetchJson(
        '/user_preference/theme'
      );
      return themeResponse.value?.theme;
    } catch (error) {
      // Don't call the error callback if 'Not found', as it just means the
      // user has not set a theme yet.
      if (error?.response?.status !== 404) {
        return errorCallback(error) ?? null;
      }
      return null;
    }
  }

  /**
   * Fetches the user's global theme preference.
   * @param {function} [errorCallback]
   */
  async getGlobalTheme(errorCallback) {
    const theme = await this.getThemeSettings(errorCallback);
    return theme?.global ?? null;
  }

  /**
   * Retrieves the user's Blockly theme preference.
   * @param {function} [errorCallback]
   */
  async getBlocklyTheme(errorCallback) {
    const theme = await this.getThemeSettings(() => ({
      blockly: errorCallback(),
    }));
    return theme?.blockly ?? null;
  }

  /**
   * Sends new theme settings to the server.
   * The server automatically merges them with any existing theme preferences.
   *
   * @param {Object} themeUpdate - A partial theme object to update (e.g., {global: 'Dark'}).
   * @param {function} [errorCallback]
   */
  async updateThemeSettings(themeUpdate, errorCallback) {
    try {
      return await HttpClient.put(
        '/user_preference',
        JSON.stringify({theme: themeUpdate}),
        true,
        {'Content-Type': 'application/json'}
      );
    } catch (error) {
      if (errorCallback) {
        errorCallback(error);
      }
    }
  }

  /**
   * Sets the user's global theme preference.
   * @param {string} globalTheme - The name of the global theme to set (e.g., 'Dark').
   */
  async setGlobalTheme(globalTheme) {
    return this.updateThemeSettings({global: globalTheme});
  }

  /**
   * Sets the user's Blockly theme preference.
   *
   * @param {string} blocklyTheme - The name of the Blockly theme to set (e.g., 'cdodeutranopia').
   * @param {function} [errorCallback] - Optional callback for handling errors, such as for signed out users.
   */
  async setBlocklyTheme(blocklyTheme, errorCallback) {
    return this.updateThemeSettings({blockly: blocklyTheme}, errorCallback);
  }
}
