import PropTypes from 'prop-types';
import React from 'react';

import DCDO from '@cdo/apps/dcdo';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import i18n from '@cdo/locale';

import ResponseMenuDropdown from './ResponseMenuDropdown';

import styles from './summary.module.scss';

const FreeResponseResponses = ({responses, showStudentNames}) => {
  const constructStudentName = response =>
    response.student_family_name
      ? response.student_display_name + ' ' + response.student_family_name
      : response.student_display_name;

  const [hiddenResponses, setHiddenResponses] = React.useState([]);

  return (
    <div className={styles.studentResponsesContent}>
      <div className={styles.studentResponsesColumns}>
        {responses
          .filter(response => !hiddenResponses.includes(response.user_id))
          .map(response => (
            <div key={response.user_id} className={styles.studentResponseBlock}>
              <div className={styles.studentAnswer}>
                <div className={styles.studentAnswerInterior}>
                  <p>{response.text}</p>
                  <ResponseMenuDropdown
                    response={response}
                    hideResponse={userId =>
                      setHiddenResponses(prevHidden => [...prevHidden, userId])
                    }
                  />
                </div>
                {DCDO.get('cfu-pin-hide-enabled', false) && (
                  <div className={styles.studentName}>
                    {showStudentNames && (
                      <p>{constructStudentName(response)}</p>
                    )}
                  </div>
                )}
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
  showStudentNames: PropTypes.bool,
};

export default FreeResponseResponses;
