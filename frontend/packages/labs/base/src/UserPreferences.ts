import {NetworkError, HttpClient} from '@code-dot-org/api';
import {
  getEnvironmentFromHostname,
  getDashboardApiUrl,
} from '@code-dot-org/core';

import type {FontSizeKey} from './constants';
import LabRegistry from './LabRegistry';

export interface UserThemeSettings {
  global?: string;
  blockly?: string;
  [key: string]: string | undefined;
}

export default class UserPreferences {
  userId: string = 'me';

  /**
   * Save the using_text_mode user preference
   * @param usingTextMode - Whether or not the user should be in text mode.
   * @param context - additional information regarding the context in which this
   *        change is occuring. Only used for logging/analysis.
   * @param context.project_id - id of the project the user is working on
   * @param context.level_id - id of the level the user is working on
   */
  setUsingTextMode(
    usingTextMode: boolean,
    context: {
      project_id?: string;
      level_id?: string;
    } = {},
  ) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      ...context,
      using_text_mode: usingTextMode,
    };

    HttpClient.post(
      `${host}/api/v1/users/${this.userId}/using_text_mode`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  async getUsingTextMode(): Promise<boolean> {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      const response = await HttpClient.fetchJson<{
        using_text_mode: boolean;
      }>(`${host}/api/v1/users/${this.userId}/using_text_mode`);
      return response.value.using_text_mode;
    } catch {
      return false;
    }
  }

  /**
   * Save the display_theme user preference
   * @param displayTheme - display mode string.
   */
  setDisplayTheme(displayTheme: string) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      display_theme: displayTheme,
    };

    HttpClient.post(
      `${host}/api/v1/users/${this.userId}/display_theme`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  async getDisplayTheme(): Promise<string> {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      const response = await HttpClient.fetchJson<{
        display_theme: string;
      }>(`${host}/api/v1/users/${this.userId}/display_theme`);
      return response.value.display_theme;
    } catch {
      return '';
    }
  }

  /**
   * Save the student list sorting preference
   * @param sortByFamilyName - True if sorting by family name, false otherwise.
   */
  setSortByFamilyName(sortByFamilyName: boolean) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      sort_by_family_name: sortByFamilyName,
    };

    HttpClient.post(
      `${host}/api/v1/users/sort_by_family_name`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  /**
   * Save the preference to show v1 or v2 progress table.
   * @param showProgressTableV2 - 'v2' if showing progress table v2, 'legacy' if showing v1.
   */
  setShowProgressTableV2(showProgressTableV2: 'v2' | 'legacy') {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      show_progress_table_v2: showProgressTableV2,
    };

    HttpClient.post(
      `${host}/api/v1/users/show_progress_table_v2`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  /**
   * Save whether the user has already seen the Welcome Popup for teacher homepage v2.
   * @param hasSeenHomepageWelcome: True if the user has seen the welcome, false otherwise.
   */
  setHasSeenProgressTableInvite(hasSeenHomepageWelcome: boolean) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      has_seen_homepage_welcome: hasSeenHomepageWelcome,
    };

    HttpClient.post(
      `${host}/api/v1/users/has_seen_homepage_welcome`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  /**
   * Save whether the user has already seen and dismissed the Personalization Alert.
   * @param hasDismissedPersonalizationAlert: True if the user has dismissed the alert, false otherwise.
   */
  setHasDismissedPersonalizationAlert(
    hasDismissedPersonalizationAlert: boolean,
  ) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      has_dismissed_personalization_alert: hasDismissedPersonalizationAlert,
    };

    HttpClient.post(
      `${host}/api/v1/users/has_dismissed_personalization_alert`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  async getHasDismissedPersonalizationAlert(): Promise<boolean> {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      const response = await HttpClient.fetchJson<{
        has_dismissed_personalization_alert: boolean;
      }>(`${host}/api/v1/users/has_dismissed_personalization_alert`);
      return response.value.has_dismissed_personalization_alert;
    } catch (error) {
      console.error(
        'Error fetching personalization alert dismissal status:',
        error,
      );
      return false;
    }
  }

  /**
   * Save the preference to opt-out of AI Rubrics (AI TA).
   * @param aiRubricsDisabled - True if disabling AI rubric features, false otherwise.
   */
  setAiRubricsDisabled(aiRubricsDisabled: boolean) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      ai_rubrics_disabled: aiRubricsDisabled,
    };

    HttpClient.post(
      `${host}/api/v1/users/ai_rubrics_disabled`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  setAiDifferentiationEnabled(aiDifferentiationEnabled: boolean) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      ai_differentiation_enabled: aiDifferentiationEnabled,
    };

    HttpClient.post(
      `${host}/api/v1/users/ai_differentiation_enabled`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  /**
   * Save the background music user preference
   * @param muteMusic - True if background music muted
   */
  setMuteMusic(muteMusic: boolean) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      mute_music: muteMusic,
    };

    HttpClient.post(
      `${host}/api/v1/users/${this.userId}/mute_music`,
      JSON.stringify(body),
      true,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  async getMuteMusic(): Promise<boolean> {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      const response = await HttpClient.fetchJson<{
        mute_music: boolean;
      }>(`${host}/api/v1/users/${this.userId}/mute_music`);
      return response.value.mute_music;
    } catch {
      return false;
    }
  }

  /**
   * Save the user's font size selection for the console or editor.
   */
  setFontSize(
    fontSize: string,
    appName: string,
    field: 'consoleFontSize' | 'editorFontSize',
  ) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    const body = {
      [field]: {
        [appName]: fontSize,
      },
    };

    HttpClient.put(`${host}/user_preference`, JSON.stringify(body), true, {
      'Content-Type': 'application/json',
    });
  }

  /**
   * Fetch the user's console font size selection.
   */
  async getConsoleFontSize(appName: string): Promise<FontSizeKey | undefined> {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      const consoleFontSizeResponse = await HttpClient.fetchJson<{
        console_font_size: {
          [key: string]: FontSizeKey;
        };
      }>(`${host}/user_preference/font_size/console`);
      const consoleFontSize =
        consoleFontSizeResponse.value.console_font_size[appName];
      return consoleFontSize;
    } catch (error) {
      // Don't log error if console font size for 'Not found'.
      // User did not save preferred console font size yet.
      if (error instanceof NetworkError) {
        if (error.response.status !== 404) {
          LabRegistry.metricsReporter.logError(
            'Error fetching console font size',
            undefined,
            {
              message: error.response,
            },
          );
        }
      }
      return;
    }
  }

  /**
   * Fetch the user's editor font size selection.
   */
  async getEditorFontSize(appName: string): Promise<FontSizeKey | undefined> {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      const editorFontSizeResponse = await HttpClient.fetchJson<{
        editor_font_size: {
          [key: string]: FontSizeKey;
        };
      }>(`${host}/user_preference/font_size/editor`);
      const editorFontSize =
        editorFontSizeResponse.value.editor_font_size[appName];
      return editorFontSize;
    } catch (error) {
      // Don't log error if editor font size for 'Not found'.
      // User did not save preferred editor font size yet.
      if (error instanceof NetworkError) {
        if (error.response.status !== 404) {
          LabRegistry.metricsReporter.logError(
            'Error fetching editor font size',
            undefined,
            {
              message: error.response,
            },
          );
        }
      }
      return;
    }
  }

  /**
   * Fetches all user theme settings (e.g., global, blockly).
   */
  async getThemeSettings(
    errorCallback: (error: NetworkError) => UserThemeSettings,
  ): Promise<UserThemeSettings | undefined> {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      const themeResponse = await HttpClient.fetchJson<{
        theme: UserThemeSettings;
      }>(`${host}/user_preference/theme`, {
        headers: {Accept: 'application/json'},
      });
      return themeResponse.value?.theme;
    } catch (error) {
      // Don't call the error callback if 'Not found', as it just means the
      // user has not set a theme yet.
      if (error instanceof NetworkError) {
        if (error.response?.status !== 404) {
          return errorCallback(error) ?? null;
        }
      }
      return;
    }
  }

  /**
   * Fetches the user's global theme preference.
   */
  async getGlobalTheme(
    errorCallback: (error: NetworkError) => UserThemeSettings,
  ): Promise<string | undefined> {
    const theme = await this.getThemeSettings(errorCallback);
    return theme?.global;
  }

  /**
   * Retrieves the user's Blockly theme preference.
   */
  async getBlocklyTheme(
    errorCallback: (error: NetworkError) => string,
  ): Promise<string | undefined> {
    const theme = await this.getThemeSettings(error => ({
      blockly: errorCallback(error),
    }));

    return theme?.blockly;
  }

  /**
   * Sends new theme settings to the server.
   * The server automatically merges them with any existing theme preferences.
   *
   * @param themeUpdate - A partial theme object to update (e.g., {global: 'Dark'}).
   */
  async updateThemeSettings(
    themeUpdate: object,
    errorCallback?: (error: NetworkError) => void,
  ) {
    const host = getDashboardApiUrl(getEnvironmentFromHostname());
    try {
      return await HttpClient.put(
        `${host}/user_preference`,
        JSON.stringify({theme: themeUpdate}),
        true,
        {'Content-Type': 'application/json'},
      );
    } catch (error) {
      if (error instanceof NetworkError) {
        if (errorCallback) {
          errorCallback(error);
        }
      }
    }
  }

  /**
   * Sets the user's global theme preference.
   * @param globalTheme - The name of the global theme to set (e.g., 'Dark').
   */
  async setGlobalTheme(globalTheme: string) {
    return this.updateThemeSettings({global: globalTheme});
  }

  /**
   * Sets the user's Blockly theme preference.
   *
   * @param blocklyTheme - The name of the Blockly theme to set (e.g., 'cdodeutranopia').
   * @param errorCallback - Optional callback for handling errors, such as for signed out users.
   */
  async setBlocklyTheme(
    blocklyTheme: string,
    errorCallback?: (error: NetworkError) => void,
  ) {
    return this.updateThemeSettings({blockly: blocklyTheme}, errorCallback);
  }
}
