import PropTypes from 'prop-types';
import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import styles from './summary.module.scss';

const ResponseMenuDropdown = ({response}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={styles.studentAnswerMenuDropdownContainer}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        isIconOnly={true}
        icon={{iconName: 'ellipsis-vertical'}}
        color={buttonColors.black}
        size="xs"
        type="tertiary"
        className={styles.studentAnswerMenuButton}
      />
      {isOpen && (
        <div className={styles.studentAnswerMenuDropdown}>
          <ul>
            <li>
              <button type="button" className={styles.dropdownOption}>
                <FontAwesomeV6Icon iconName="thumbtack" />
                Pin response
              </button>
            </li>
            <li>
              <button className={styles.dropdownOption} type="button">
                <FontAwesomeV6Icon iconName="eye-slash" />
                Hide response
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

ResponseMenuDropdown.propTypes = {
  response: PropTypes.object,
};

export default ResponseMenuDropdown;
