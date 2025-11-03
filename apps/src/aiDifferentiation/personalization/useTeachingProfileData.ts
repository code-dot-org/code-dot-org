import {useCallback, useEffect, useState} from 'react';

const API_ENDPOINT = '/teaching_profile_data';

export interface TeachingProfileData {
  selectedGoals?: string[];
  selectedSupports?: string[];
  otherSupportText?: string;
  otherGoalText?: string;
  selectedConfidence?: number;
  yearsTeaching?: number;
  dateYearsTeachingSet?: Date | null;
  classroomVision?: string;
  challenge?: string;
  matchedPersona?: string;
}

type TeachingProfileApiData = Omit<
  TeachingProfileData,
  'dateYearsTeachingSet'
> & {
  dateYearsTeachingSet?: string | null;
};

interface TeachingProfileApiResponse {
  exists: boolean;
  data?: TeachingProfileApiData | null;
}

export const deserializeTeachingProfileData = (
  data: TeachingProfileApiData
): TeachingProfileData => {
  const {dateYearsTeachingSet, ...rest} = data;
  let parsedDate: Date | null = null;

  if (dateYearsTeachingSet) {
    const candidateDate = new Date(dateYearsTeachingSet);
    parsedDate = isNaN(candidateDate.getTime()) ? null : candidateDate;
  }

  return {
    ...rest,
    dateYearsTeachingSet: parsedDate,
  };
};

interface UseTeachingProfileDataResult {
  data: TeachingProfileData | null;
  loading: boolean;
  hasFetched: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useTeachingProfileData = (): UseTeachingProfileDataResult => {
  const [data, setData] = useState<TeachingProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const csrfToken =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') || '';
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {'X-CSRF-Token': csrfToken},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teaching profile data');
      }

      const result = (await response.json()) as TeachingProfileApiResponse;

      if (result.exists && result.data) {
        setData(deserializeTeachingProfileData(result.data));
      } else {
        setData(null);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load teaching profile data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setHasFetched(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    hasFetched,
    error,
    refresh: fetchData,
  };
};
