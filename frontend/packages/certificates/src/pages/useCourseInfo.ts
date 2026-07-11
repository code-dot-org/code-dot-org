import {useEffect, useState} from 'react';

import type {CertificateCourseInfo} from '@/certificate/model/certificateTypes';
import {fetchCourseInfo} from '@/lib/api';
import {getPageLocale} from '@/localization/certificateLocale';

export function useCourseInfo(course: string | null): {
  courseInfo: CertificateCourseInfo | null;
  error: boolean;
} {
  const [courseInfo, setCourseInfo] = useState<CertificateCourseInfo | null>(
    null,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!course) {
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting stale course data synchronously when `course` changes is the intended behavior, not incidental cascading state.
    setCourseInfo(null);
    setError(false);
    fetchCourseInfo(getPageLocale(), course)
      .then(info => {
        if (!cancelled) {
          setCourseInfo(info);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [course]);

  return {courseInfo, error};
}
