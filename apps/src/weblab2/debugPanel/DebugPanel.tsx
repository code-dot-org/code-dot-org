import {
  BodyFourText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {NetworkEntry} from '../redux/networkRedux';

import NetworkRequestChip from './NetworkRequestChip';

import moduleStyles from './debug-panel.module.scss';

interface DebugPanelProps {
  className?: string;
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = ({className}) => {
  const networkRequests = useAppSelector(
    state => state.weblab2Network.requests
  );
  const [selectedRequest, setSelectedRequest] = React.useState<
    NetworkEntry | undefined
  >(
    networkRequests.length > 0
      ? networkRequests[networkRequests.length - 1]
      : undefined
  );

  useEffect(() => {
    if (!selectedRequest && networkRequests.length > 0) {
      setSelectedRequest(networkRequests[networkRequests.length - 1]);
    }
  }, [networkRequests, selectedRequest]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = networkRequests.find(
      request => request.id === event.target.value
    );
    setSelectedRequest(selected);
  };

  return (
    <PanelContainer
      id={'debug-panel-container'}
      headerContent={'Debug'}
      className={className}
    >
      {networkRequests.length === 0 ? (
        <div>No network requests</div>
      ) : (
        <div className={moduleStyles.debugPanelContainer}>
          <div className={moduleStyles.networkSummary}>
            <div className={moduleStyles.networkSummaryHeader}>
              <BodyFourText>
                <StrongText>Network Activity</StrongText>
              </BodyFourText>
              <BodyFourText>{networkRequests.length} Items</BodyFourText>
            </div>
            <div className={moduleStyles.requestList}>
              {networkRequests.map(request => (
                <NetworkRequestChip
                  key={request.id}
                  request={request}
                  onChange={onInputChange}
                  isSelected={selectedRequest?.id === request.id}
                />
              ))}
            </div>
          </div>
          <div className={moduleStyles.requestDetails}>
            {selectedRequest?.request.url}
          </div>
        </div>
      )}
    </PanelContainer>
  );
};

export default DebugPanel;
