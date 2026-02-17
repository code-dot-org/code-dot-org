import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useMemo} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import RequestFailureDivider from '@cdo/apps/weblab2/debugPanel/images/RequestFailure.svg';
import ResponseFailureDivider from '@cdo/apps/weblab2/debugPanel/images/ResponseFailure.svg';
import SuccessDivider from '@cdo/apps/weblab2/debugPanel/images/Success.svg';
import {NetworkEntry} from '@cdo/apps/weblab2/redux/networkRedux';
import {setDebugPanelOpen} from '@cdo/apps/weblab2/weblab2Redux';

import DetailsBox from './DetailsBox';
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
  >(networkRequests.length > 0 ? networkRequests[0] : undefined);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!selectedRequest && networkRequests.length > 0) {
      setSelectedRequest(networkRequests[0]);
    } else if (networkRequests.length === 0 && selectedRequest !== undefined) {
      setSelectedRequest(undefined);
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
      return {
        dividerIcon: SuccessDivider,
        dividerAltText: 'Request and response success',
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
  }, [requestSuccess, responseSuccess]);

  const responseRows = useMemo(() => {
    if (selectedRequest?.response) {
      const rows = [
        [
          {
            label: 'Status',
            value: selectedRequest?.response?.status,
          },
          {
            label: 'Time',
            value: selectedRequest?.response?.timeElapsed + ' ms',
          },
        ],
      ];
      let responseDataValue = `Cannot display response data of type ${selectedRequest?.response?.contentType}`;
      if (!selectedRequest.response?.body) {
        responseDataValue = 'No response data found';
      } else if (
        selectedRequest?.response?.contentType?.startsWith('text') ||
        selectedRequest?.response?.contentType?.startsWith('application/json')
      ) {
        responseDataValue = selectedRequest.response.body;
      }
      rows.push([
        {
          label: 'Response Data',
          value: responseDataValue,
        },
      ]);
      return rows;
    }
    return [];
  }, [selectedRequest]);

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
            <DetailsBox
              title="Request"
              success={requestSuccess}
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
            {selectedRequest?.response ? (
              <DetailsBox
                title="Response"
                success={responseSuccess}
                rows={responseRows}
                errorMessage={
                  !responseSuccess
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
