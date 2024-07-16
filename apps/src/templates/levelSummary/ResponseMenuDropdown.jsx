import PropTypes from 'prop-types';
import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import DCDO from '@cdo/apps/dcdo';
import i18n from '@cdo/locale';

import styles from './summary.module.scss';

const ResponseMenuDropdown = ({response, hideResponse}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!DCDO.get('cfu-pin-hide-enabled', false)) {
    return null;
  }

  return (
    <div className={styles.studentAnswerMenuDropdownContainer}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        isIconOnly={true}
        icon={{iconName: 'ellipsis-vertical', title: i18n.additionalOptions()}}
        color={buttonColors.purple}
        size="xs"
        type="tertiary"
        className={styles.studentAnswerMenuButton}
      />
      {isOpen && (
        <div className={styles.studentAnswerMenuDropdown}>
          <ul>
            <li>
              <button
                type="button"
                className={styles.dropdownOption}
                onClick={() => setIsOpen(false)}
              >
                <FontAwesomeV6Icon iconName="thumbtack" />
                {i18n.pinResponse()}
              </button>
            </li>
            <li>
              <button
                className={styles.dropdownOption}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  hideResponse(response);
                }}
              >
                <FontAwesomeV6Icon iconName="eye-slash" />
                {i18n.hideResponse()}
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
  hideResponse: PropTypes.func,
};

export default ResponseMenuDropdown;
