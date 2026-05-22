import {useParams} from '@tanstack/react-router';
import {useEffect} from 'react';

import NotebookLab from '@code-dot-org/notebook-lab';

import {useActiveSeat} from '@/modules/seats/useActiveSeat';

/** Maps studio Language to the locale key NotebookLab stores in localStorage. */
const NOTEBOOK_LOCALE: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

/** Standalone notebook editor — wraps NotebookLab for the /projects/notebook/:channelId/edit route. */
export function NotebookEntrypoint(): React.ReactElement {
  const {channelId} = useParams({strict: false});
  const {activeSeat} = useActiveSeat();
  const seatId = activeSeat?.id ?? 'guest';
  const language = activeSeat?.language ?? 'en';

  useEffect(() => {
    localStorage.setItem(
      `nblab.locale.${seatId}`,
      NOTEBOOK_LOCALE[language] ?? 'en-US',
    );
  }, [seatId, language]);

  return <NotebookLab channelId={channelId ?? 'default'} seatId={seatId} />;
}

export default NotebookEntrypoint;
