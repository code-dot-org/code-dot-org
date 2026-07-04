import {useQuery, type UseQueryOptions} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {
  AssignmentCourseOfferings,
  AvailableParticipantTypes,
  TeacherDashboardSectionsResponse,
} from './sections.types';
import {sectionsKeys} from './sections.keys';

export function useValidCourseOfferings(
  api: ApiClient,
  options?: Omit<
    UseQueryOptions<AssignmentCourseOfferings>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: sectionsKeys.validCourseOfferings(),
    queryFn: () => api.sections.getValidCourseOfferings(),
    ...options,
  });
}

export function useAvailableParticipantTypes(
  api: ApiClient,
  options?: Omit<
    UseQueryOptions<AvailableParticipantTypes>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: sectionsKeys.availableParticipantTypes(),
    queryFn: () => api.sections.getAvailableParticipantTypes(),
    ...options,
  });
}

export function useTeacherDashboardSections(
  api: ApiClient,
  options?: Omit<
    UseQueryOptions<TeacherDashboardSectionsResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: sectionsKeys.teacherDashboardSections(),
    queryFn: () => api.sections.getTeacherDashboardSections(),
    ...options,
  });
}
