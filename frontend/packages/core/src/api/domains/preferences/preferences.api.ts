import type {Transport} from '../../transports/types';
import {ApiError} from '../../transports/types';
import {
  ConsoleFontSizeSchema,
  DisplayThemeSchema,
  EditorFontSizeSchema,
  MuteMusicSchema,
  UserThemeSettingsSchema,
  UsingTextModeSchema,
} from './preferences.schemata';
import type {UserThemeSettings, FontSize} from './preferences.types';

export function createPreferencesApi(transport: Transport) {
  return {
    /**
     * POST /api/v1/users/me/using_text_mode
     */
    async setUsingTextMode(params: {
      usingTextMode: boolean;
      context?: {
        project_id?: string;
        level_id?: string;
      };
    }) {
      const {usingTextMode, context} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/using_text_mode',
        body: {
          ...(context || {}),
          using_text_mode: usingTextMode,
        },
      });
    },

    /**
     * GET /api/v1/users/me/using_text_mode
     */
    async getUsingTextMode() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/using_text_mode',
      });

      return UsingTextModeSchema.parse(raw);
    },

    /**
     * POST /api/v1/users/me/display_theme
     */
    async setDisplayTheme(params: {displayTheme: string}) {
      const {displayTheme} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/display_theme',
        body: {
          display_theme: displayTheme,
        },
      });
    },

    /**
     * GET /api/v1/users/me/display_theme
     */
    async getDisplayTheme() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/display_theme',
      });

      return DisplayThemeSchema.parse(raw);
    },

    /**
     * POST /api/v1/users/me/mute_music
     */
    async setMuteMusic(params: {muteMusic: boolean}) {
      const {muteMusic} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/mute_music',
        body: {
          mute_music: muteMusic,
        },
      });
    },

    /**
     * GET /api/v1/users/me/mute_music
     */
    async getMuteMusic() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/mute_music',
      });

      return MuteMusicSchema.parse(raw);
    },

    /**
     * POST /api/v1/users/sort_by_family_name
     */
    async setSortByFamilyName(params: {sortByFamilyName: boolean}) {
      const {sortByFamilyName} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/sort_by_family_name',
        body: {
          sort_by_family_name: sortByFamilyName,
        },
      });
    },

    /**
     * POST /api/v1/users/show_progress_table_v2
     */
    async setShowProgressTableV2(params: {showProgressTableV2: boolean}) {
      const {showProgressTableV2} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/show_progress_table_v2',
        body: {
          sort_by_family_name: showProgressTableV2,
        },
      });
    },

    /**
     * POST /api/v1/users/ai_rubrics_disabled
     */
    async setAiRubricsDisabled(params: {aiRubricsDisabled: boolean}) {
      const {aiRubricsDisabled} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/ai_rubrics_disabled',
        body: {
          ai_rubrics_disabled: aiRubricsDisabled,
        },
      });
    },

    /**
     * POST /api/v1/users/ai_differentiation_enabled
     */
    async setAiDifferentiationEnabled(params: {
      aiDifferentiationEnabled: boolean;
    }) {
      const {aiDifferentiationEnabled} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/ai_differentiation_enabled',
        body: {
          ai_differentiation_enabled: aiDifferentiationEnabled,
        },
      });
    },

    /**
     * PUT /user_preference?:field[:appName]=:fontSize
     */
    async setFontSize(params: {
      fontSize: FontSize;
      appName: string;
      field: 'consoleFontSize' | 'editorFontSize';
    }) {
      const {fontSize, appName, field} = params;

      return transport.request<unknown>({
        method: 'PUT',
        url: '/user_preference',
        body: {
          [field]: {
            [appName]: fontSize,
          },
        },
      });
    },

    /**
     * GET /user_preference/font_size/console
     */
    async getConsoleFontSize(params: {appName: string}): Promise<FontSize> {
      const {appName} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/user_preference/font_size/console',
      });

      const validated = ConsoleFontSizeSchema.parse(raw);
      return (validated.console_font_size[appName] || 'Medium') as FontSize;
    },

    /**
     * GET /user_preference/font_size/editor
     */
    async getEditorFontSize(params: {appName: string}): Promise<FontSize> {
      const {appName} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/user_preference/font_size/editor',
      });

      const validated = EditorFontSizeSchema.parse(raw);
      return (validated.editor_font_size[appName] || 'Medium') as FontSize;
    },

    /**
     * PUT /user_preference?sectionOrder=:orderedSectionIds
     */
    async setSectionOrder(params: {orderedSectionIds: number[]}) {
      const {orderedSectionIds} = params;

      return transport.request<unknown>({
        method: 'PUT',
        url: '/user_preference',
        body: {
          sectionOrder: orderedSectionIds,
        },
      });
    },

    /**
     * GET /user_preference/theme
     */
    async getThemeSettings(params: {
      errorCallback: (error: ApiError) => UserThemeSettings;
    }): Promise<UserThemeSettings | null> {
      const {errorCallback} = params;

      try {
        const raw = await transport.request<unknown>({
          method: 'GET',
          url: '/user_preference/theme',
        });

        return UserThemeSettingsSchema.parse(raw);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status !== 404) {
            return errorCallback(error) ?? null;
          }
        }
      }
      return null;
    },

    async getGlobalTheme(params: {
      errorCallback: (error: ApiError) => UserThemeSettings;
    }) {
      return (await this.getThemeSettings(params))?.global;
    },

    async getBlocklyTheme(params: {
      errorCallback: (error: ApiError) => string;
    }) {
      return (
        await this.getThemeSettings({
          errorCallback: error => ({
            blockly: params.errorCallback(error),
          }),
        })
      )?.blockly;
    },

    /**
     * PUT /user_preference?theme=...
     *
     * Sends new theme settings to the server.
     * The server automatically merges them with any existing theme preferences.
     *
     * @param themeUpdate - A partial theme object to update (e.g., {global: 'Dark'}).
     */
    async updateThemeSettings(params: {
      themeUpdate: UserThemeSettings;
      errorCallback?: (error: ApiError) => void;
    }) {
      const {themeUpdate, errorCallback} = params;

      try {
        await transport.request<unknown>({
          method: 'PUT',
          url: '/user_preference',
          body: {
            theme: themeUpdate,
          },
        });
      } catch (error) {
        if (error instanceof ApiError) {
          if (errorCallback) {
            errorCallback(error);
          }
        }
      }
    },

    /**
     * Sets the user's global theme preference.
     * @param globalTheme - The name of the global theme to set (e.g., 'Dark').
     */
    async setGlobalTheme(params: {globalTheme: string}) {
      return this.updateThemeSettings({
        themeUpdate: {global: params.globalTheme},
      });
    },

    /**
     * Sets the user's Blockly theme preference.
     *
     * @param blocklyTheme - The name of the Blockly theme to set (e.g., 'cdodeutranopia').
     * @param errorCallback - Optional callback for handling errors, such as for signed out users.
     */
    async setBlocklyTheme(params: {
      blocklyTheme: string;
      errorCallback?: (error: ApiError) => void;
    }) {
      const {blocklyTheme, errorCallback} = params;

      return this.updateThemeSettings({
        themeUpdate: {blockly: blocklyTheme},
        errorCallback,
      });
    },
  };
}
