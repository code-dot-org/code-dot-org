import PropTypes from 'prop-types';
import React from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import i18n from '@cdo/locale';

import ResponseMenuDropdown from './ResponseMenuDropdown';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses}) => {
  const [hiddenResponses, setHiddenResponses] = React.useState([]);

  return (
    <div className={styles.studentResponsesContent}>
      <div className={styles.studentResponsesColumns}>
        {responses
          .filter(response => !hiddenResponses.includes(response.user_id))
          .map(response => (
            <div key={response.user_id} className={styles.studentAnswer}>
              <div className={styles.studentAnswerInterior}>
                <p>{response.text}</p>
                <ResponseMenuDropdown
                  response={response}
                  hideResponse={userId =>
                    setHiddenResponses(prevHidden => [...prevHidden, userId])
                  }
                />
              </div>
            </div>
          ))}
      </div>
      {hiddenResponses.length > 0 && (
        <Alert
          icon={{iconName: 'eye-slash'}}
          onClick={() => setHiddenResponses([])}
          link={{
            text: i18n.showHiddenResponses(),
            onClick: e => {
              e.preventDefault();
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
};

export default FreeResponseResponses;
