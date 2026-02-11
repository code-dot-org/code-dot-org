import {RadioButton} from '@code-dot-org/component-library/radioButton';
import FontAwesomeV6Icon from 'node_modules/@code-dot-org/component-library/dist/fontAwesomeV6Icon/FontAwesomeV6Icon';
import React, {ChangeEvent, useMemo} from 'react';

import {FullRequest} from '../redux/networkRedux';

import moduleStyles from './network-request-chip.module.scss';

interface NetworkRequestChipProps {
  request: FullRequest;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
}

const NetworkRequestChip: React.FunctionComponent<NetworkRequestChipProps> = ({
  request,
  onChange,
  isSelected,
}) => {
  const requestIcon = useMemo(() => {
    if (request.response?.status === 200) {
      return 'check-circle';
    } else if (!request.response && !request.request.cspDirectiveViolated) {
      return 'xmark-circle';
    } else {
      return 'spinner';
    }
  }, [request.request.cspDirectiveViolated, request.response]);

  return (
    <div className={moduleStyles.networkRequestChip}>
      <RadioButton
        name={request.request.url}
        checked={isSelected}
        onChange={onChange}
        size={'s'}
        value={request.request.url}
        label={request.request.url}
      />
      <FontAwesomeV6Icon iconName={requestIcon} />
    </div>
  );
};

export default NetworkRequestChip;
