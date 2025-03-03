import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {Workshop} from '../WorkshopFormTemplate/types';

export const useWorkshop = (): Workshop | null => {
  const {workshopId} = useParams();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!workshopId) return;

    const fetchWorkshop = async () => {
      const response = await fetch(`/api/v1/pd/workshops/${workshopId}`);
      if (response.ok) {
        const data = await response.json();
        if (mounted) {
          setWorkshop(data);
        }
      }
    };

    fetchWorkshop();

    return () => {
      mounted = false;
    };
  }, [workshopId]);

  return workshop;
};
