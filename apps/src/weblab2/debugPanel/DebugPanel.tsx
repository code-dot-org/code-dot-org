import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  OverlineThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useMemo} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import RequestFailureDivider from '@cdo/apps/weblab2/debugPanel/images/RequestFailure.svg';
import ResponseFailureDivier from '@cdo/apps/weblab2/debugPanel/images/ResponseFailure.svg';
import SuccessDivider from '@cdo/apps/weblab2/debugPanel/images/Success.svg';

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

  const requestSuccess = useMemo(() => {
    if (selectedRequest) {
      return selectedRequest.request.cspDirectiveViolated === undefined;
    }
    return false;
  }, [selectedRequest]);

  const responseSuccess = useMemo(() => {
    if (selectedRequest?.response) {
      return selectedRequest.response.status < 300;
    }
    return false;
  }, [selectedRequest]);

  const {dividerIcon, dividerAltText} = useMemo(() => {
    if (requestSuccess && responseSuccess) {
      return {dividerIcon: SuccessDivider, dividerAltText: 'Success'};
    } else if (requestSuccess) {
      return {
        dividerIcon: ResponseFailureDivier,
        dividerAltText: 'Response Failure',
      };
    } else {
      return {
        dividerIcon: RequestFailureDivider,
        dividerAltText: 'Request Failure',
      };
    }
  }, [requestSuccess, responseSuccess]);

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
          <div className={moduleStyles.detailsContainer}>
            <div className={moduleStyles.detailsBox}>
              <div className={moduleStyles.detailsHeader}>
                <BodyThreeText className={moduleStyles.detailsHeaderText}>
                  <StrongText>Request</StrongText>
                </BodyThreeText>
                <FontAwesomeV6Icon
                  iconName={requestSuccess ? 'check-circle' : 'xmark-circle'}
                  className={
                    requestSuccess
                      ? moduleStyles.successIcon
                      : moduleStyles.errorIcon
                  }
                />
              </div>
              <div className={moduleStyles.detailsBody}>
                <div className={moduleStyles.detailsRow}>
                  <div className={moduleStyles.detailsField}>
                    <OverlineThreeText
                      className={moduleStyles.detailsFieldLabel}
                    >
                      Method
                    </OverlineThreeText>
                    <BodyThreeText className={moduleStyles.detailsFieldValue}>
                      {selectedRequest?.request.method}
                    </BodyThreeText>
                  </div>
                  <div className={moduleStyles.detailsField}>
                    <OverlineThreeText
                      className={moduleStyles.detailsFieldLabel}
                    >
                      Request Time
                    </OverlineThreeText>
                    <BodyThreeText className={moduleStyles.detailsFieldValue}>
                      {selectedRequest?.request.startTime}
                    </BodyThreeText>
                  </div>
                </div>
                <div className={moduleStyles.detailsField}>
                  <OverlineThreeText className={moduleStyles.detailsFieldLabel}>
                    URL
                  </OverlineThreeText>
                  <BodyThreeText className={moduleStyles.detailsFieldValue}>
                    {selectedRequest?.request.url}
                  </BodyThreeText>
                </div>
              </div>
            </div>
            <img src={dividerIcon} alt={dividerAltText} />
            <div className={moduleStyles.detailsBox}>
              {selectedRequest?.response?.status}
            </div>
          </div>
        </div>
      )}
    </PanelContainer>
  );
};

export default DebugPanel;
