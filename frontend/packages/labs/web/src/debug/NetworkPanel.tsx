import {IconButton, Typography} from '@mui/material';
import {useEffect, useMemo, useState, type ChangeEvent} from 'react';

import {IconDropdown} from '@code-dot-org/component-library/dropdown';
import type {IconDropdownOption} from '@code-dot-org/component-library/dropdown/iconDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import PendingDivider from '../assets/Pending.svg';
import RequestFailureDivider from '../assets/RequestFailure.svg';
import ResponseFailureDivider from '../assets/ResponseFailure.svg';
import SuccessDivider from '../assets/Success.svg';

import {useDebug, type NetworkEntry} from './DebugContext';
import {DetailsBox, type DetailsField} from './DetailsBox';
import {EmptyPanelPlaceholder} from './EmptyPanelPlaceholder';
import styles from './networkPanel.module.css';
import {NetworkRequestChip} from './NetworkRequestChip';

// The network pane: an activity list on the left, the selected request's and
// response's details on the right, joined by a status divider. Ported from
// apps/src/weblab2/debugPanel/NetworkPanel.tsx.

const SORT_OPTIONS: IconDropdownOption[] = [
  {
    value: 'newest',
    label: 'Newest first',
    icon: {iconName: 'arrow-down-wide-short'},
  },
  {
    value: 'oldest',
    label: 'Oldest first',
    icon: {iconName: 'arrow-up-short-wide'},
  },
];

/**
 * The response body as text: JSON pretty-printed, other text shown as-is, and
 * anything else named rather than dumped as bytes.
 */
export function formatResponseBody(
  body: string | undefined,
  contentType: string | undefined,
): string {
  if (!body) {
    return '-';
  }
  if (contentType?.startsWith('text')) {
    return body;
  }
  if (/^application\/([\w.-]+\+)?json/.test(contentType ?? '')) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      // Not valid JSON after all; show what actually arrived.
      return body;
    }
  }
  return `Cannot display response data of type ${contentType}`;
}

export const NetworkPanel = () => {
  const {requests, blockNetwork, setBlockNetwork} = useDebug();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [newestFirst, setNewestFirst] = useState(true);

  const orderedRequests = useMemo(
    () => (newestFirst ? [...requests].reverse() : [...requests]),
    [requests, newestFirst],
  );

  // Track the selection by id rather than by entry: an entry is replaced
  // wholesale when its response lands, so holding the object would pin stale
  // data. Default to the first row, and follow it if the list empties.
  const selectedRequest: NetworkEntry | undefined = useMemo(
    () =>
      orderedRequests.find(request => request.id === selectedId) ??
      orderedRequests[0],
    [orderedRequests, selectedId],
  );

  useEffect(() => {
    if (selectedId && !requests.some(request => request.id === selectedId)) {
      setSelectedId(undefined);
    }
  }, [requests, selectedId]);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) =>
    setSelectedId(event.target.value);

  const requestSuccess = Boolean(
    selectedRequest &&
      selectedRequest.request.cspDirectiveViolated === undefined &&
      !selectedRequest.request.blocked,
  );
  const responseSuccess = Boolean(
    selectedRequest?.response && (selectedRequest.response.status ?? 0) < 300,
  );
  // Pending means the request went out and we are still waiting — not that it
  // was refused before it ever left.
  const responsePending = Boolean(
    selectedRequest &&
      !selectedRequest.request.blocked &&
      selectedRequest.request.cspDirectiveViolated === undefined &&
      !selectedRequest.response,
  );

  const {dividerIcon, dividerAltText} = useMemo(() => {
    if (requestSuccess && responseSuccess) {
      return {
        dividerIcon: SuccessDivider,
        dividerAltText: 'Request and response success',
      };
    }
    if (requestSuccess && responsePending) {
      return {
        dividerIcon: PendingDivider,
        dividerAltText: 'Request success, response pending',
      };
    }
    if (requestSuccess) {
      return {
        dividerIcon: ResponseFailureDivider,
        dividerAltText: 'Response failure',
      };
    }
    return {
      dividerIcon: RequestFailureDivider,
      dividerAltText: 'Request failure',
    };
  }, [requestSuccess, responseSuccess, responsePending]);

  const responseRows: DetailsField[][] = useMemo(
    () => [
      [
        {label: 'Status', value: selectedRequest?.response?.status ?? '-'},
        {
          label: 'Duration',
          value: selectedRequest?.response?.timeElapsed
            ? `${selectedRequest.response.timeElapsed} ms`
            : '-',
        },
      ],
      [
        {
          label: 'Response Data',
          value: formatResponseBody(
            selectedRequest?.response?.body,
            selectedRequest?.response?.contentType,
          ),
          copyable: true,
        },
      ],
    ],
    [selectedRequest?.response],
  );

  const requestErrorMessage = useMemo(() => {
    if (selectedRequest?.request.blocked) {
      return 'Network requests are blocked.';
    }
    if (selectedRequest?.request.cspDirectiveViolated) {
      let requestDomain = selectedRequest.request.url;
      try {
        requestDomain = new URL(selectedRequest.request.url).origin;
      } catch {
        // Unparseable; name the whole URL instead.
      }
      return `Sorry, ${requestDomain} is not in our list of available APIs.`;
    }
    return undefined;
  }, [selectedRequest]);

  const blockToggleLabel = blockNetwork
    ? 'Unblock network activity'
    : 'Block network activity';

  return (
    <div className={styles.networkPanelContainer}>
      <div className={styles.networkSummary}>
        <div className={styles.networkSummaryHeader}>
          <Typography variant="body4" gutterBottom>
            <Typography variant="strong">Activity</Typography>
          </Typography>
          <div className={styles.networkHeaderButtons}>
            <WithTooltip
              tooltipProps={{
                text: blockToggleLabel,
                direction: 'onBottom',
                tooltipId: 'block-network-tooltip',
                size: 'xs',
              }}
            >
              <IconButton
                color={blockNetwork ? 'error' : 'tertiary'}
                variant={blockNetwork ? 'contained' : 'outlined'}
                size="extraSmall"
                onClick={() => setBlockNetwork(!blockNetwork)}
                aria-label={blockToggleLabel}
                aria-pressed={blockNetwork}
                type="button"
              >
                <FontAwesomeV6Icon iconName="ban" />
              </IconButton>
            </WithTooltip>
            {orderedRequests.length > 0 && (
              <IconDropdown
                name="sort-order"
                // Hidden with CSS to save space; IconDropdown still requires it,
                // and aria-label carries the accessible name.
                labelText=""
                size="xs"
                className={styles.sortDropdown}
                options={SORT_OPTIONS}
                selectedOption={newestFirst ? SORT_OPTIONS[0] : SORT_OPTIONS[1]}
                onChange={option => setNewestFirst(option.value === 'newest')}
                aria-label="Change sort order"
                color="gray"
              />
            )}
          </div>
        </div>
        <div className={styles.requestList}>
          {orderedRequests.length === 0 ? (
            <Typography variant="body4" className={styles.emptyText}>
              No activity to show
            </Typography>
          ) : (
            orderedRequests.map(request => (
              <NetworkRequestChip
                key={request.id}
                request={request}
                onChange={onInputChange}
                isSelected={selectedRequest?.id === request.id}
                newestFirst={newestFirst}
              />
            ))
          )}
        </div>
      </div>
      <div className={styles.detailsContainer}>
        {!selectedRequest ? (
          <EmptyPanelPlaceholder
            iconName="globe"
            title="No network activity"
            description="Network request details will appear here when your app makes API calls."
          />
        ) : (
          <>
            <DetailsBox
              title="Request"
              status={requestSuccess ? 'success' : 'error'}
              rows={[
                [
                  {
                    label: 'Method',
                    value: selectedRequest.request.method || 'Unknown',
                  },
                  {
                    label: 'Request Time',
                    value: selectedRequest.request.startTime,
                  },
                ],
                [
                  {
                    label: 'URL',
                    value: selectedRequest.request.url,
                    copyable: true,
                  },
                ],
              ]}
              errorMessage={requestErrorMessage}
            />
            <img src={dividerIcon} alt={dividerAltText} />
            {responsePending || selectedRequest.response ? (
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
                    ? `Response failed with status code ${selectedRequest.response?.status}`
                    : undefined
                }
              />
            ) : (
              // The request never went out, so there is no response to show.
              <div className={styles.responsePlaceholder}>
                <Typography variant="body3" gutterBottom>
                  Response
                </Typography>
                <FontAwesomeV6Icon
                  iconName="circle"
                  className={styles.placeholderIcon}
                  iconStyle="regular"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
