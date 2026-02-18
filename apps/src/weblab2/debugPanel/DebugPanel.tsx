import Button from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {isEqual} from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import PendingDivider from '@cdo/apps/weblab2/debugPanel/images/Pending.svg';
import RequestFailureDivider from '@cdo/apps/weblab2/debugPanel/images/RequestFailure.svg';
import ResponseFailureDivider from '@cdo/apps/weblab2/debugPanel/images/ResponseFailure.svg';
import SuccessDivider from '@cdo/apps/weblab2/debugPanel/images/Success.svg';
import {NetworkEntry} from '@cdo/apps/weblab2/redux/networkRedux';
import {setDebugPanelOpen} from '@cdo/apps/weblab2/weblab2Redux';

import DetailsBox from './DetailsBox';
import NetworkRequestChip from './NetworkRequestChip';
import NoRequestsPlaceholder from './NoRequestsPlaceholder';

import moduleStyles from './debug-panel.module.scss';

interface DebugPanelProps {
  className?: string;
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = ({className}) => {
  const networkRequests = useAppSelector(
    state => state.weblab2Network.requests
  );
  const [orderedNetworkRequests, setOrderedNetworkRequests] = useState(
    [...networkRequests].reverse()
  );
  const [selectedRequest, setSelectedRequest] = useState<
    NetworkEntry | undefined
  >(orderedNetworkRequests.length > 0 ? orderedNetworkRequests[0] : undefined);
  const dispatch = useAppDispatch();
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    if (!selectedRequest && orderedNetworkRequests.length > 0) {
      setSelectedRequest(orderedNetworkRequests[0]);
    } else if (
      orderedNetworkRequests.length === 0 &&
      selectedRequest !== undefined
    ) {
      setSelectedRequest(undefined);
    } else if (selectedRequest) {
      // If the selected request has changed in redux (e.g. we received a response for it),
      // update the selected request to reflect those changes.
      const matchingRequest = orderedNetworkRequests.find(
        request => request.id === selectedRequest.id
      );
      if (!matchingRequest) {
        setSelectedRequest(undefined);
        return;
      }
      if (!isEqual(matchingRequest, selectedRequest)) {
        setSelectedRequest(matchingRequest);
      }
    }
  }, [orderedNetworkRequests, selectedRequest]);

  useEffect(() => {
    setOrderedNetworkRequests(
      newestFirst ? [...networkRequests].reverse() : [...networkRequests]
    );
  }, [networkRequests, newestFirst]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = orderedNetworkRequests.find(
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

  // A response is pending if it did not fail due to a csp violation but we don't yet have a response.
  const responsePending = useMemo(() => {
    return (
      selectedRequest?.request.cspDirectiveViolated === undefined &&
      !selectedRequest?.response
    );
  }, [
    selectedRequest?.request.cspDirectiveViolated,
    selectedRequest?.response,
  ]);

  const showResponseDetails = useMemo(() => {
    return responsePending || selectedRequest?.response;
  }, [responsePending, selectedRequest]);

  const {dividerIcon, dividerAltText} = useMemo(() => {
    if (requestSuccess && responseSuccess) {
      return {
        dividerIcon: SuccessDivider,
        dividerAltText: 'Request and response success',
      };
    } else if (requestSuccess && responsePending) {
      return {
        dividerIcon: PendingDivider,
        dividerAltText: 'Request success, response pending',
      };
    } else if (requestSuccess) {
      return {
        dividerIcon: ResponseFailureDivider,
        dividerAltText: 'Response failure',
      };
    } else {
      return {
        dividerIcon: RequestFailureDivider,
        dividerAltText: 'Request failure',
      };
    }
  }, [requestSuccess, responseSuccess, responsePending]);

  const responseRows = useMemo(() => {
    const rows = [
      [
        {
          label: 'Status',
          value: selectedRequest?.response?.status || '-',
        },
        {
          label: 'Duration',
          value: selectedRequest?.response?.timeElapsed
            ? selectedRequest.response.timeElapsed + ' ms'
            : '-',
        },
      ],
    ];
    let responseDataValue = `Cannot display response data of type ${selectedRequest?.response?.contentType}`;
    if (!selectedRequest?.response?.body) {
      responseDataValue = '-';
    } else if (selectedRequest?.response?.contentType?.startsWith('text')) {
      responseDataValue = selectedRequest.response.body;
    } else if (
      selectedRequest?.response?.contentType?.startsWith('application/json')
    ) {
      try {
        responseDataValue = JSON.stringify(
          JSON.parse(selectedRequest.response.body),
          null,
          2
        );
      } catch {
        // Fall back to unformatted response if parsing fails.
        responseDataValue = selectedRequest.response.body;
      }
    }
    rows.push([
      {
        label: 'Response Data',
        value: responseDataValue,
      },
    ]);
    return rows;
  }, [selectedRequest?.response]);

  const requestErrorMessage = useMemo(() => {
    if (selectedRequest?.request.cspDirectiveViolated) {
      let requestDomain = selectedRequest.request.url;
      try {
        const url = new URL(selectedRequest.request.url);
        requestDomain = url.origin;
      } catch {
        // Fall back to the full URL if parsing fails.
      }
      // TODO: once we have documentation we should link to the allow-list here.
      return `Sorry, ${requestDomain} is not in our list of available APIs.`;
    }
    return undefined;
  }, [selectedRequest]);

  return (
    <PanelContainer
      id={'debug-panel-container'}
      headerContent={'Debug'}
      className={className}
      rightHeaderContent={
        <CloseButton
          onClick={() => dispatch(setDebugPanelOpen(false))}
          aria-label="Close debug panel"
        />
      }
    >
      {orderedNetworkRequests.length === 0 ? (
        <NoRequestsPlaceholder />
      ) : (
        <div className={moduleStyles.debugPanelContainer}>
          <div className={moduleStyles.networkSummary}>
            <div className={moduleStyles.networkSummaryHeader}>
              <BodyFourText>
                <StrongText>Activity</StrongText>
              </BodyFourText>
              <Button
                onClick={() => setNewestFirst(!newestFirst)}
                size="xs"
                type="secondary"
                iconLeft={{iconName: 'sort'}}
                text={newestFirst ? 'Newest first' : 'Oldest first'}
                color={'gray'}
              />
            </div>
            <div className={moduleStyles.requestList}>
              {orderedNetworkRequests.map(request => (
                <NetworkRequestChip
                  key={request.id}
                  request={request}
                  onChange={onInputChange}
                  isSelected={selectedRequest?.id === request.id}
                  newestFirst={newestFirst}
                />
              ))}
            </div>
          </div>
          <div className={moduleStyles.detailsContainer}>
            <DetailsBox
              title="Request"
              status={requestSuccess ? 'success' : 'error'}
              rows={[
                [
                  {
                    label: 'Method',
                    value: selectedRequest?.request.method || 'Unknown',
                  },
                  {
                    label: 'Request Time',
                    value: selectedRequest?.request.startTime,
                  },
                ],
                [{label: 'URL', value: selectedRequest?.request.url}],
              ]}
              errorMessage={requestErrorMessage}
            />
            <img src={dividerIcon} alt={dividerAltText} />
            {showResponseDetails ? (
              <DetailsBox
                title="Response"
                status={
                  responsePending
                    ? 'pending'
                    : responseSuccess
                    ? 'success'
                    : 'error'
                }
                rows={responseRows}
                errorMessage={
                  !responseSuccess && !responsePending
                    ? `Response failed with status code ${selectedRequest?.response?.status}`
                    : undefined
                }
              />
            ) : (
              <div className={moduleStyles.responsePlaceholder}>
                <BodyThreeText>Response</BodyThreeText>
                <FontAwesomeV6Icon
                  iconName="circle"
                  className={moduleStyles.placeholderIcon}
                  iconStyle="regular"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </PanelContainer>
  );
};

export default DebugPanel;
