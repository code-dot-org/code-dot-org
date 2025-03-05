import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {Workshop} from '../WorkshopFormTemplate/types';

export const useWorkshop = (): {
  workshop: Workshop | null;
  loading: boolean;
  error: string | null;
} => {
  const {workshopId} = useParams();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!workshopId) return;
    mounted && setError(null);

    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/v1/pd/workshops/${workshopId}`);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        mounted && setWorkshop(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        mounted && setError(errorMessage);
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchWorkshop();

    return () => {
      mounted = false;
    };
  }, [workshopId]);

  return {workshop, loading, error};
};
