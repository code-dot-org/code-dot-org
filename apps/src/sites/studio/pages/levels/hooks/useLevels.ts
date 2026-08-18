import {useState, useEffect, useCallback} from 'react';

import {LevelsResponse, SearchParams, CloneResponse} from '../types/levels';

export const useLevels = () => {
  const [data, setData] = useState<LevelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchLevels = useCallback(async (params: SearchParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          urlParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/levels.json?${urlParams.toString()}`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setSearchParams(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const cloneLevel = useCallback(
    async (levelId: number, newName: string): Promise<CloneResponse> => {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

      const response = await fetch(`/levels/${levelId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({name: newName}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Clone failed');
      }

      return result;
    },
    []
  );

  const deleteLevel = useCallback(async (levelId: number): Promise<void> => {
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');

    const response = await fetch(`/levels/${levelId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Delete failed');
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return {
    data,
    loading,
    error,
    searchParams,
    fetchLevels,
    cloneLevel,
    deleteLevel,
  };
};
