import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import React, {ChangeEvent, useEffect, useMemo, useRef} from 'react';

import {NetworkEntry} from '@cdo/apps/weblab2/redux/networkRedux';

import parentStyles from './debug-panel.module.scss';
import moduleStyles from './network-request-chip.module.scss';

interface NetworkRequestChipProps {
  request: NetworkEntry;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
  newestFirst: boolean;
}

const NetworkRequestChip: React.FunctionComponent<NetworkRequestChipProps> = ({
  request,
  onChange,
  isSelected,
  newestFirst,
}) => {
  const requestIcon = useMemo(() => {
    if (request.response && request.response.status < 300) {
      return {iconName: 'check-circle', className: parentStyles.successIcon};
    } else if (!request.response && !request.request.cspDirectiveViolated) {
      return {
        iconName: 'spinner',
        className: parentStyles.loadingIcon,
        animationType: 'spin' as const,
      };
    } else {
      return {iconName: 'xmark-circle', className: parentStyles.errorIcon};
    }
  }, [request.request.cspDirectiveViolated, request.response]);

  const label = useMemo(() => {
    try {
      const url = new URL(request.request.url);
      const lastSegment = url.pathname.split('/').filter(Boolean).pop();
      return lastSegment || url.hostname;
    } catch {
      return request.request.url;
    }
  }, [request.request.url]);

  const chipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && chipRef.current) {
      requestAnimationFrame(() => {
        chipRef.current?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
      });
    }
  }, [isSelected, newestFirst]);

  return (
    <div ref={chipRef} className={moduleStyles.networkRequestChip}>
      <RadioButton
        name={'network-requests'}
        checked={isSelected}
        onChange={onChange}
        size={'xs'}
        value={request.id}
        label={label}
        className={moduleStyles.radioButton}
      />
      <FontAwesomeV6Icon
        iconName={requestIcon.iconName}
        className={requestIcon.className}
        animationType={requestIcon.animationType}
      />
    </div>
  );
};

export default NetworkRequestChip;
