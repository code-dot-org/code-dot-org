import PropTypes from 'prop-types';
import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses}) => (
  <div className={styles.studentResponsesColumns}>
    {responses.map(response => (
      <div key={response.user_id} className={styles.studentAnswer}>
        <p>{response.text}</p>
        <Button
          onClick={() => {}}
          isIconOnly={true}
          icon={{iconName: 'ellipsis-vertical'}}
          color={buttonColors.black}
          size="xs"
          type="tertiary"
          className={styles.studentAnswerMenuButton}
        />
      </div>
    ))}
  </div>
);

FreeResponseResponses.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object),
};

export default FreeResponseResponses;
