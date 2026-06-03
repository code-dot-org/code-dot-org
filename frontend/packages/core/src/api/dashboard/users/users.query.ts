import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {
  ContactDetails,
  CurrentPermissions,
  CurrentUser,
  DonorTeacherBannerDetails,
  HasDismissedPersonalizationAlert,
  NetsimSignedIn,
  PostponeCensusBanner,
  SchoolName,
} from './users.types';
import {usersKeys} from './users.keys';

// --- Queries ---

export function useCurrentUser(
  api: ApiClient,
  options?: Omit<UseQueryOptions<CurrentUser>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: usersKeys.currentUser(),
    queryFn: () => api.users.getCurrentUser(),
    ...options,
  });
}

export function useUserSignedIn(
  api: ApiClient,
  options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: usersKeys.signedIn(),
    queryFn: () => api.users.getUserSignedIn(),
    ...options,
  });
}

export function useNetsimSignedIn(
  api: ApiClient,
  options?: Omit<UseQueryOptions<NetsimSignedIn>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: usersKeys.netsimSignedIn(),
    queryFn: () => api.users.getNetsimSignedIn(),
    ...options,
  });
}

export function useSchoolName(
  api: ApiClient,
  options?: Omit<UseQueryOptions<SchoolName>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: usersKeys.schoolName(),
    queryFn: () => api.users.getSchoolName(),
    ...options,
  });
}

export function useContactDetails(
  api: ApiClient,
  options?: Omit<UseQueryOptions<ContactDetails>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: usersKeys.contactDetails(),
    queryFn: () => api.users.getContactDetails(),
    ...options,
  });
}

export function useDonorTeacherBannerDetails(
  api: ApiClient,
  options?: Omit<
    UseQueryOptions<DonorTeacherBannerDetails>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: usersKeys.donorTeacherBannerDetails(),
    queryFn: () => api.users.getDonorTeacherBannerDetails(),
    ...options,
  });
}

export function useTosVersion(
  api: ApiClient,
  options?: Omit<UseQueryOptions<number>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: usersKeys.tosVersion(),
    queryFn: () => api.users.getTosVersion(),
    ...options,
  });
}

export function useCurrentPermissions(
  api: ApiClient,
  options?: Omit<UseQueryOptions<CurrentPermissions>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: usersKeys.currentPermissions(),
    queryFn: () => api.users.getCurrentPermissions(),
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
    queryKey: usersKeys.hasDismissedPersonalizationAlert(),
    queryFn: () => api.users.getHasDismissedPersonalizationAlert(),
    ...options,
  });
}

// --- Mutations ---

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
      api.users.setHasDismissedPersonalizationAlert(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.hasDismissedPersonalizationAlert(),
      });
    },
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
      api.users.setHasSeenHomepageWelcome(params),
    ...options,
  });
}

export function useAcceptDataTransferAgreement(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: () => api.users.acceptDataTransferAgreement(),
    ...options,
  });
}

export function usePostponeCensusBanner(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<PostponeCensusBanner, Error, void>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: () => api.users.postponeCensusBanner(),
    ...options,
  });
}

export function useDismissCensusBanner(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<PostponeCensusBanner, Error, void>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: () => api.users.dismissCensusBanner(),
    ...options,
  });
}

export function useDismissDonorTeacherBanner(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {participate: boolean; source: string}>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {participate: boolean; source: string}) =>
      api.users.dismissDonorTeacherBanner(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.donorTeacherBannerDetails(),
      });
    },
    ...options,
  });
}

export function useDismissParentEmailBanner(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: () => api.users.dismissParentEmailBanner(),
    ...options,
  });
}

export function useSetStandardsReportInfoToSeen(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: () => api.users.setStandardsReportInfoToSeen(),
    ...options,
  });
}

export function useSetHasSeenProgressTableV2Invitation(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {hasSeenProgressTableV2Invitation: boolean; showProgressTableV2: boolean}
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {
      hasSeenProgressTableV2Invitation: boolean;
      showProgressTableV2: boolean;
    }) => api.users.setHasSeenProgressTableV2Invitation(params),
    ...options,
  });
}

export function useSetDateProgressTableInvitationLastDelayed(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {dateProgressTableInvitationLastDelayed: string}
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {dateProgressTableInvitationLastDelayed: string}) =>
      api.users.setDateProgressTableInvitationLastDelayed(params),
    ...options,
  });
}

export function useSetHasSeenAiAssessmentsAnnouncement(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: () => api.users.setHasSeenAiAssessmentsAnnouncement(),
    ...options,
  });
}

export function useDisableLtiRosterSync(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: () => api.users.disableLtiRosterSync(),
    ...options,
  });
}

export function useUpdateAiTutorAccess(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {userId: number; aiTutorAccess: boolean}
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {userId: number; aiTutorAccess: boolean}) =>
      api.users.updateAiTutorAccess(params),
    ...options,
  });
}

export function useSetHasCompletedAiDifferentiationWelcome(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: () => api.users.setHasCompletedAiDifferentiationWelcome(),
    ...options,
  });
}

export function useSetSeenTaScores(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {lessonId: number}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {lessonId: number}) =>
      api.users.setSeenTaScores(params),
    ...options,
  });
}

export function useVerifyCaptcha(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<unknown, Error, {recaptchaResponse: string}>,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (params: {recaptchaResponse: string}) =>
      api.users.verifyCaptcha(params),
    ...options,
  });
}
