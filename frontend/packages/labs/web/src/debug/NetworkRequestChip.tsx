import {useEffect, useMemo, useRef, type ChangeEvent} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {RadioButton} from '@code-dot-org/component-library/radioButton';

import type {NetworkEntry} from './DebugContext';
import networkStyles from './networkPanel.module.css';
import styles from './networkRequestChip.module.css';

// One row in the activity list: a radio selecting the request, plus an icon for
// how it went. Ported from apps/src/weblab2/debugPanel/NetworkRequestChip.tsx.

export interface NetworkRequestChipProps {
  request: NetworkEntry;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
  /** Only used to re-scroll the selection when the sort order flips. */
  newestFirst: boolean;
}

export const NetworkRequestChip = ({
  request,
  onChange,
  isSelected,
  newestFirst,
}: NetworkRequestChipProps) => {
  const requestIcon = useMemo(() => {
    if (request.request.blocked) {
      return {iconName: 'ban', className: networkStyles.errorIcon};
    }
    if (request.response && (request.response.status ?? 0) < 300) {
      return {iconName: 'check-circle', className: networkStyles.successIcon};
    }
    if (!request.response && !request.request.cspDirectiveViolated) {
      return {
        iconName: 'spinner',
        className: networkStyles.loadingIcon,
        animationType: 'spin' as const,
      };
    }
    return {iconName: 'xmark-circle', className: networkStyles.errorIcon};
  }, [
    request.request.blocked,
    request.request.cspDirectiveViolated,
    request.response,
  ]);

  // The last path segment is the recognisable part of a URL in a narrow chip;
  // fall back to the host, then to the raw string for anything unparseable.
  const label = useMemo(() => {
    try {
      const url = new URL(request.request.url);
      return url.pathname.split('/').filter(Boolean).pop() || url.hostname;
    } catch {
      return request.request.url;
    }
  }, [request.request.url]);

  const chipRef = useRef<HTMLDivElement>(null);

  // Keep the selected chip in view as the list grows or is reordered.
  useEffect(() => {
    if (isSelected && chipRef.current) {
      const chip = chipRef.current;
      const frame = requestAnimationFrame(() =>
        chip.scrollIntoView({block: 'nearest', behavior: 'smooth'}),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [isSelected, newestFirst]);

  return (
    <div ref={chipRef} className={styles.networkRequestChip}>
      <RadioButton
        name="network-requests"
        checked={isSelected}
        onChange={onChange}
        size="xs"
        value={request.id}
        label={label}
        className={styles.radioButton}
      />
      <FontAwesomeV6Icon
        iconName={requestIcon.iconName}
        className={requestIcon.className}
        animationType={
          'animationType' in requestIcon ? requestIcon.animationType : undefined
        }
      />
    </div>
  );
};
