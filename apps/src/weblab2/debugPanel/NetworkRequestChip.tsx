import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import React, {ChangeEvent, useMemo} from 'react';

import {NetworkEntry} from '@cdo/apps/weblab2/redux/networkRedux';

import parentStyles from './debug-panel.module.scss';
import moduleStyles from './network-request-chip.module.scss';

interface NetworkRequestChipProps {
  request: NetworkEntry;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
}

const NetworkRequestChip: React.FunctionComponent<NetworkRequestChipProps> = ({
  request,
  onChange,
  isSelected,
}) => {
  const requestIcon = useMemo(() => {
    if (request.response && request.response.status < 300) {
      return {iconName: 'check-circle', className: parentStyles.successIcon};
    } else if (!request.response && !request.request.cspDirectiveViolated) {
      return {iconName: 'spinner', className: parentStyles.loadingIcon};
    } else {
      return {iconName: 'xmark-circle', className: parentStyles.errorIcon};
    }
  }, [request.request.cspDirectiveViolated, request.response]);

  const label = useMemo(() => {
    try {
      return new URL(request.request.url).hostname;
    } catch {
      return request.request.url;
    }
  }, [request.request.url]);

  return (
    <div className={moduleStyles.networkRequestChip}>
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
      />
    </div>
  );
};

export default NetworkRequestChip;
