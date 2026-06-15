import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';

import {accountKeys} from './account.keys';
import type {
  AccountSettings,
  CreatePasswordParams,
  DeleteAccountParams,
  UpdateEmailParams,
  UpdateParentEmailParams,
  UpdatePasswordParams,
  UpdateProfileParams,
  UpdateUserTypeParams,
} from './account.types';

// --- Query ---

export function useAccountSettings(
  api: ApiClient,
  options?: Omit<UseQueryOptions<AccountSettings>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: accountKeys.settings(),
    queryFn: ({signal}) => api.account.getSettings(signal),
    ...options,
  });
}

// --- Mutations that change the settings payload (invalidate the read) ---

function useSettingsMutation<TParams>(
  mutationFn: (params: TParams) => Promise<unknown>,
  options?: Omit<UseMutationOptions<unknown, Error, TParams>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: accountKeys.settings()});
    },
    ...options,
  });
}

export function useUpdateProfile(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, UpdateProfileParams>,
    'mutationFn'
  >,
) {
  return useSettingsMutation(
    params => api.account.updateProfile(params),
    options,
  );
}

export function useUpdateEmail(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, UpdateEmailParams>,
    'mutationFn'
  >,
) {
  return useSettingsMutation(
    params => api.account.updateEmail(params),
    options,
  );
}

export function useUpdatePassword(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, UpdatePasswordParams>,
    'mutationFn'
  >,
) {
  return useSettingsMutation(
    params => api.account.updatePassword(params),
    options,
  );
}

export function useCreatePassword(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, CreatePasswordParams>,
    'mutationFn'
  >,
) {
  return useSettingsMutation(
    params => api.account.createPassword(params),
    options,
  );
}

export function useUpdateUserType(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, UpdateUserTypeParams>,
    'mutationFn'
  >,
) {
  return useSettingsMutation(
    params => api.account.updateUserType(params),
    options,
  );
}

export function useUpdateParentEmail(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, UpdateParentEmailParams>,
    'mutationFn'
  >,
) {
  return useSettingsMutation(
    params => api.account.updateParentEmail(params),
    options,
  );
}

export function useRemoveParentEmail(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useSettingsMutation(() => api.account.removeParentEmail(), options);
}

// --- Mutations with no settings read to refresh ---

export function useDeleteAccount(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, DeleteAccountParams>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: DeleteAccountParams) =>
      api.account.deleteAccount(params),
    ...options,
  });
}

export function useSignOutOtherSessions(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: () => api.account.signOutOtherSessions(),
    ...options,
  });
}
