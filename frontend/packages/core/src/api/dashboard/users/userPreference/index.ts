import type {KyInstance} from 'ky';
import type {
  UserPreferenceThemeRequest,
  UserPreferenceThemeResponse,
} from './types';

export default {
  /** GET /user_preference/theme */
  getTheme: (http: KyInstance) => () => {
    return http
      .get(`user_preference/theme`)
      .json<UserPreferenceThemeResponse>();
  },
  /** PUT /user_preference/theme */
  updateTheme: (http: KyInstance) => (data: UserPreferenceThemeRequest) => {
    return http.put(`user_preference/theme`, {json: data}).json();
  },
};
