import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import i18n from '@cdo/locale';

import ResponseMenuDropdown from './ResponseMenuDropdown';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses}) => {
  const [hiddenResponses, setHiddenResponses] = React.useState([]);
  const [pinnedResponseIds, setPinnedResponseIds] = React.useState([]);

  const pinnedResponses = React.useMemo(() => {
    return responses.filter(response =>
      pinnedResponseIds.includes(response.user_id)
    );
  }, [responses, pinnedResponseIds]);

  const filteredResponses = React.useMemo(() => {
    return responses
      .filter(response => !pinnedResponseIds.includes(response.user_id))
      .filter(response => !hiddenResponses.includes(response.user_id));
  }, [responses, pinnedResponseIds, hiddenResponses]);

  return (
    <div className={styles.studentResponsesContent}>
      <div className={styles.pinnedResponsesColumns}>
        {pinnedResponses
          .filter(response => !hiddenResponses.includes(response.user_id))
          .map(response => (
            <div
              key={response.user_id}
              className={classNames(
                styles.studentAnswer,
                styles.pinnedResponse
              )}
            >
              <p>{response.text}</p>
              <ResponseMenuDropdown
                response={response}
                hideResponse={response =>
                  setHiddenResponses(prevHidden => [
                    ...prevHidden,
                    response.user_id,
                  ])
                }
                unpinResponse={response =>
                  setPinnedResponseIds(prevPinned =>
                    prevPinned.filter(id => id !== response.user_id)
                  )
                }
              />
            </div>
          ))}
      </div>
      <div className={styles.studentResponsesColumns}>
        {filteredResponses.map(response => (
          <div
            key={response.user_id}
            className={classNames(
              styles.studentAnswer,
              styles.unpinnedResponse
            )}
          >
            <p>{response.text}</p>
            <ResponseMenuDropdown
              response={response}
              hideResponse={response =>
                setHiddenResponses(prevHidden => [
                  ...prevHidden,
                  response.user_id,
                ])
              }
              pinResponse={response =>
                setPinnedResponseIds(prevPinned => [
                  ...prevPinned,
                  response.user_id,
                ])
              }
            />
          </div>
        ))}
      </div>
      {hiddenResponses.length > 0 && (
        <Alert
          icon={{iconName: 'eye-slash'}}
          onClick={() => setHiddenResponses([])}
          link={{
            text: i18n.showHiddenResponses(),
            onClick: () => setHiddenResponses([]),
            href: null,
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
};

export default FreeResponseResponses;
