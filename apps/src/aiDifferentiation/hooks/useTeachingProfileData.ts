import {useCallback, useEffect, useState} from 'react';

export interface PersonalizationData {
  selectedGoals: string[];
  selectedSupports: string[];
  otherSupportText: string;
  otherGoalText: string;
  selectedConfidence: number;
  yearsTeaching: number;
  dateYearsTeachingSet: Date | null;
  classroomVision: string;
  challenge: string;
}

interface UseTeachingProfileDataReturn {
  personalizationData: PersonalizationData;
  setPersonalizationData: React.Dispatch<
    React.SetStateAction<PersonalizationData>
  >;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useTeachingProfileData(): UseTeachingProfileDataReturn {
  const [personalizationData, setPersonalizationData] =
    useState<PersonalizationData>({} as PersonalizationData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeachingProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/teaching_profile_data', {
        method: 'GET',
        headers: {
          'X-CSRF-Token':
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute('content') || '',
        },
      });

      if (!response.ok) {
        console.error(
          `Failed to load existing teaching profile data:${response.statusText}`
        );
        return;
      }

      const result = await response.json();
      console.log(result, result.data);
      if (result.exists && result.data) {
        const existingData = {...result.data};
        if (existingData.dateYearsTeachingSet) {
          existingData.dateYearsTeachingSet = new Date(
            existingData.dateYearsTeachingSet
          );
        }
        setPersonalizationData(existingData);
      }
    } catch (error) {
      console.error('Failed to load existing teaching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Automatically fetch once on mount
  useEffect(() => {
    fetchTeachingProfileData();
  }, [fetchTeachingProfileData]);

  return {
    personalizationData,
    setPersonalizationData,
    isLoading,
    refetch: fetchTeachingProfileData,
  };
}
