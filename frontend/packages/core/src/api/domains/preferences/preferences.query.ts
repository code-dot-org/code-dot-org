import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {ApiError} from '../../transports/types';
import type {
  DisplayTheme,
  FontSize,
  HasDismissedPersonalizationAlert,
  MuteMusic,
  UserThemeSettings,
  UsingTextMode,
} from './preferences.types';
import {preferencesKeys} from './preferences.keys';

// --- Queries ---

export function useUsingTextMode(
  api: ApiClient,
  options?: Omit<UseQueryOptions<UsingTextMode>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: preferencesKeys.usingTextMode(),
    queryFn: () => api.preferences.getUsingTextMode(),
    ...options,
  });
}

export function useDisplayTheme(
  api: ApiClient,
  options?: Omit<UseQueryOptions<DisplayTheme>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: preferencesKeys.displayTheme(),
    queryFn: () => api.preferences.getDisplayTheme(),
    ...options,
  });
}

export function useMuteMusic(
  api: ApiClient,
  options?: Omit<UseQueryOptions<MuteMusic>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: preferencesKeys.muteMusic(),
    queryFn: () => api.preferences.getMuteMusic(),
    ...options,
  });
}

export function useHasDismissedPersonalizationAlert(
  api: ApiClient,
  options?: Omit<
    UseQueryOptions<HasDismissedPersonalizationAlert>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: preferencesKeys.hasDismissedPersonalizationAlert(),
    queryFn: () => api.preferences.getHasDismissedPersonalizationAlert(),
    ...options,
  });
}

export function useConsoleFontSize(
  api: ApiClient,
  params: {appName: string},
  options?: Omit<UseQueryOptions<FontSize>, 'queryKey' | 'queryFn'>,
) {
  const {appName} = params;

  return useQuery({
    queryKey: preferencesKeys.consoleFontSize(appName),
    queryFn: () => api.preferences.getConsoleFontSize({appName}),
    enabled: !!appName,
    ...options,
  });
}

export function useEditorFontSize(
  api: ApiClient,
  params: {appName: string},
  options?: Omit<UseQueryOptions<FontSize>, 'queryKey' | 'queryFn'>,
) {
  const {appName} = params;

  return useQuery({
    queryKey: preferencesKeys.editorFontSize(appName),
    queryFn: () => api.preferences.getEditorFontSize({appName}),
    enabled: !!appName,
    ...options,
  });
}

export function useThemeSettings(
  api: ApiClient,
  params: {errorCallback: (error: ApiError) => UserThemeSettings},
  options?: Omit<
    UseQueryOptions<UserThemeSettings | null>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: preferencesKeys.themeSettings(),
    queryFn: () => api.preferences.getThemeSettings(params),
    ...options,
  });
}

// --- Mutations with corresponding queries to invalidate ---

export function useSetUsingTextMode(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {
        usingTextMode: boolean;
        context?: {project_id?: string; level_id?: string};
      }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      usingTextMode: boolean;
      context?: {project_id?: string; level_id?: string};
    }) => api.preferences.setUsingTextMode(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.usingTextMode(),
      });
    },
    ...options,
  });
}

export function useSetDisplayTheme(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {displayTheme: string}>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {displayTheme: string}) =>
      api.preferences.setDisplayTheme(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.displayTheme(),
      });
    },
    ...options,
  });
}

export function useSetMuteMusic(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {muteMusic: boolean}>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {muteMusic: boolean}) =>
      api.preferences.setMuteMusic(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.muteMusic(),
      });
    },
    ...options,
  });
}

export function useSetHasDismissedPersonalizationAlert(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {hasDismissedPersonalizationAlert: boolean}
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {hasDismissedPersonalizationAlert: boolean}) =>
      api.preferences.setHasDismissedPersonalizationAlert(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.hasDismissedPersonalizationAlert(),
      });
    },
    ...options,
  });
}

export function useSetFontSize(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {
        fontSize: FontSize;
        appName: string;
        field: 'consoleFontSize' | 'editorFontSize';
      }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      fontSize: FontSize;
      appName: string;
      field: 'consoleFontSize' | 'editorFontSize';
    }) => api.preferences.setFontSize(params),
    onSuccess: (_data, params) => {
      const key =
        params.field === 'consoleFontSize'
          ? preferencesKeys.consoleFontSize(params.appName)
          : preferencesKeys.editorFontSize(params.appName);
      queryClient.invalidateQueries({queryKey: key});
    },
    ...options,
  });
}

export function useUpdateThemeSettings(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {
        themeUpdate: UserThemeSettings;
        errorCallback?: (error: ApiError) => void;
      }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      themeUpdate: UserThemeSettings;
      errorCallback?: (error: ApiError) => void;
    }) => api.preferences.updateThemeSettings(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.themeSettings(),
      });
    },
    ...options,
  });
}

// --- Fire-and-forget mutations (no corresponding GET) ---

export function useSetSortByFamilyName(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {sortByFamilyName: boolean}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {sortByFamilyName: boolean}) =>
      api.preferences.setSortByFamilyName(params),
    ...options,
  });
}

export function useSetShowProgressTableV2(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {showProgressTableV2: boolean}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {showProgressTableV2: boolean}) =>
      api.preferences.setShowProgressTableV2(params),
    ...options,
  });
}

export function useSetHasSeenHomepageWelcome(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {hasSeenHomepageWelcome: boolean}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {hasSeenHomepageWelcome: boolean}) =>
      api.preferences.setHasSeenHomepageWelcome(params),
    ...options,
  });
}

export function useSetAiRubricsDisabled(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {aiRubricsDisabled: boolean}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {aiRubricsDisabled: boolean}) =>
      api.preferences.setAiRubricsDisabled(params),
    ...options,
  });
}

export function useSetAiDifferentiationEnabled(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {aiDifferentiationEnabled: boolean}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {aiDifferentiationEnabled: boolean}) =>
      api.preferences.setAiDifferentiationEnabled(params),
    ...options,
  });
}

export function useSetSectionOrder(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {orderedSectionIds: number[]}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {orderedSectionIds: number[]}) =>
      api.preferences.setSectionOrder(params),
    ...options,
  });
}
