import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import i18n from '@cdo/locale';

import ResponseMenuDropdown from './ResponseMenuDropdown';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses}) => {
  const [hiddenResponses, setHiddenResponses] = React.useState([]);

  return (
    <div className={styles.studentResponsesColumns}>
      {responses
        .filter(response => !hiddenResponses.includes(response.user_id))
        .map(response => (
          <div key={response.user_id} className={styles.studentAnswer}>
            <p>{response.text}</p>
            <ResponseMenuDropdown
              response={response}
              hideResponse={response =>
                setHiddenResponses(prevHidden => [
                  ...prevHidden,
                  response.user_id,
                ])
              }
            />
          </div>
        ))}
      <Button
        onClick={() => setHiddenResponses([])}
        text={i18n.showAllResponses()}
      />
    </div>
  );
};

FreeResponseResponses.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object),
};

export default FreeResponseResponses;
