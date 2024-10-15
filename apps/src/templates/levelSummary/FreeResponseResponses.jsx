import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getFullName} from '@cdo/apps/templates/manageStudents/utils.ts';
import i18n from '@cdo/locale';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses, showStudentNames, eventData}) => {
  const constructStudentName = response =>
    getFullName(response.student_display_name, response.student_family_name);

  const [hiddenResponses, setHiddenResponses] = React.useState([]);
  const [pinnedResponseIds, setPinnedResponseIds] = React.useState([]);

  const pinnedResponses = React.useMemo(() => {
    return responses.filter(response =>
      pinnedResponseIds.includes(response.user_id)
    );
  }, [responses, pinnedResponseIds]);

  const hideResponse = userId => {
    analyticsReporter.sendEvent(
      EVENTS.CFU_RESPONSE_HIDDEN,
      eventData,
      PLATFORMS.BOTH
    );
    setHiddenResponses(prevHidden => [...prevHidden, userId]);
  };

  const getMenuOptions = (pinResponse, unpinResponse, response) => {
    return [
      {
        value: unpinResponse ? 'unpin-option' : 'pin-option',
        label: unpinResponse ? i18n.unpinResponse() : i18n.pinResponse(),
        icon: unpinResponse
          ? {iconName: 'thumbtack-slash', iconStyle: 'solid'}
          : {
              iconName: 'thumbtack',
              iconStyle: 'solid',
              className: 'uitest-pin-response',
            },
        onClick: () =>
          unpinResponse
            ? unpinResponse(response.user_id)
            : pinResponse(response.user_id),
      },
      {
        value: 'hide-option',
        label: i18n.hideResponse(),
        icon: {
          iconName: 'eye-slash',
          iconStyle: 'solid',
          className: 'uitest-hide-response',
        },
        onClick: () => hideResponse(response.user_id),
      },
    ];
  };

  //This resets the pinned and hidden responses when the responses change so that
  //pinned and hidden responses are not carried over between different questions
  useEffect(() => {
    setPinnedResponseIds([]);
    setHiddenResponses([]);
  }, [responses]);

  const getResponseBox = (
    response,
    responseClassName,
    pinResponse = undefined,
    unpinResponse = undefined
  ) => (
    <div key={response.user_id} className={styles.studentResponseBlock}>
      <div key={response.user_id} className={styles.studentAnswer}>
        <div
          className={classNames(
            styles.studentAnswerInterior,
            responseClassName
          )}
        >
          <p>{response.text}</p>
          <ActionDropdown
            name="free-response"
            menuPlacement="right"
            labelText={i18n.additionalOptions()}
            size="xs"
            triggerButtonProps={{
              isIconOnly: true,
              icon: {iconName: 'ellipsis-vertical', iconStyle: 'solid'},
              type: 'tertiary',
              color: unpinResponse ? 'white' : 'purple',
              className: unpinResponse
                ? styles.freeresponsePinnedDropdown
                : styles.freeresponseUnpinnedDropdown,
            }}
            options={getMenuOptions(pinResponse, unpinResponse, response)}
          />
        </div>
      </div>
      <div className={styles.studentName}>
        {showStudentNames && <p>{constructStudentName(response)}</p>}
      </div>
    </div>
  );

  return (
    <div className={styles.studentResponsesContent}>
      {pinnedResponses.length > 0 && (
        <div className={styles.pinResponsesSection}>
          <div className={styles.pinResponsesHeader}>
            <FontAwesomeV6Icon
              iconName="thumbtack"
              className={styles.pinHeaderIcon}
              scale="1.25x"
            />
            <Heading3>{i18n.pinnedResponses()}</Heading3>
            <Button
              text={i18n.unpinAll()}
              onClick={() => {
                analyticsReporter.sendEvent(
                  EVENTS.CFU_RESPONSE_ALL_UNPINNED,
                  eventData,
                  PLATFORMS.BOTH
                );
                setPinnedResponseIds([]);
              }}
              color={buttonColors.gray}
              type="secondary"
            />
          </div>
          <div className={styles.pinnedResponsesColumns}>
            {pinnedResponses
              .filter(response => !hiddenResponses.includes(response.user_id))
              .map(response =>
                getResponseBox(
                  response,
                  styles.pinnedResponse,
                  undefined,
                  userId => {
                    analyticsReporter.sendEvent(
                      EVENTS.CFU_RESPONSE_UNPINNED,
                      eventData,
                      PLATFORMS.BOTH
                    );
                    setPinnedResponseIds(prevPinned =>
                      prevPinned.filter(id => id !== userId)
                    );
                  }
                )
              )}
          </div>
        </div>
      )}
      <div className={styles.studentResponsesColumns}>
        {responses
          .filter(
            response =>
              !pinnedResponseIds.includes(response.user_id) &&
              !hiddenResponses.includes(response.user_id)
          )
          .map(response =>
            getResponseBox(
              response,
              styles.unpinnedResponse,
              userId => {
                analyticsReporter.sendEvent(
                  EVENTS.CFU_RESPONSE_PINNED,
                  eventData,
                  PLATFORMS.BOTH
                );
                setPinnedResponseIds(prevPinned => [...prevPinned, userId]);
              },
              undefined
            )
          )}
      </div>
      {hiddenResponses.length > 0 && (
        <Alert
          icon={{iconName: 'eye-slash'}}
          onClick={() => setHiddenResponses([])}
          link={{
            text: i18n.showHiddenResponses(),
            onClick: e => {
              e.preventDefault();
              analyticsReporter.sendEvent(
                EVENTS.CFU_RESPONSE_ALL_UNHID,
                eventData,
                PLATFORMS.BOTH
              );
              setHiddenResponses([]);
            },
            role: 'button',
            href: '#',
          }}
          text={i18n.hiddenResponses({
            numHiddenResponses: hiddenResponses.length,
          })}
          type="gray"
        />
      )}
    </div>
  );
};

FreeResponseResponses.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object),
  showStudentNames: PropTypes.bool,
  eventData: PropTypes.object,
};

export default FreeResponseResponses;
