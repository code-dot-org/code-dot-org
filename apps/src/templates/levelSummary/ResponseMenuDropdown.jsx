import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import DCDO from '@cdo/apps/dcdo';
import i18n from '@cdo/locale';

import unpinIcon from './images/solid-thumbtack-slash.svg';

import styles from './summary.module.scss';

const ResponseMenuDropdown = ({
  response,
  hideResponse,
  pinResponse,
  unpinResponse,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!DCDO.get('cfu-pin-hide-enabled', false)) {
    return null;
  }

  const getPinnedDropdownOption = () => {
    if (unpinResponse) {
      return (
        <button
          className={styles.dropdownOption}
          type="button"
          onClick={() => {
            setIsOpen(false);
            unpinResponse(response.user_id);
          }}
        >
          <i className={styles.unpinIcon}>
            <img src={unpinIcon} alt="" />
          </i>
          {i18n.unpinResponse()}
        </button>
      );
    } else {
      return (
        <button
          type="button"
          className={styles.dropdownOption}
          onClick={() => {
            setIsOpen(false);
            pinResponse(response.user_id);
          }}
        >
          <FontAwesomeV6Icon iconName="thumbtack" />
          {i18n.pinResponse()}
        </button>
      );
    }
  };

  return (
    <div className={styles.studentAnswerMenuDropdownContainer}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        isIconOnly={true}
        icon={{iconName: 'ellipsis-vertical', title: i18n.additionalOptions()}}
        color={buttonColors.purple}
        size="xs"
        type="tertiary"
        className={classNames(
          styles.studentAnswerMenuButton,
          unpinResponse && styles.studentAnswerMenuButtonPinned
        )}
      />
      {isOpen && (
        <div className={styles.studentAnswerMenuDropdown}>
          <ul>
            <li>{getPinnedDropdownOption()}</li>
            <li>
              <button
                className={styles.dropdownOption}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  hideResponse(response.user_id);
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
  pinResponse: PropTypes.func,
  unpinResponse: PropTypes.func,
};

export default ResponseMenuDropdown;
