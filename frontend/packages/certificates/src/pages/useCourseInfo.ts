import {useEffect, useState} from 'react';

import {fetchCertificateCourse, type CertificateCourse} from '@/api/courses';
import {getPageLocale} from '@/localization/certificateLocale';

export function useCourseInfo(course: string | null): {
  courseInfo: CertificateCourse | null;
  error: boolean;
} {
  const [courseInfo, setCourseInfo] = useState<CertificateCourse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!course) {
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting stale course data synchronously when `course` changes is the intended behavior, not incidental cascading state.
    setCourseInfo(null);
    setError(false);
    fetchCertificateCourse(course, getPageLocale())
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
