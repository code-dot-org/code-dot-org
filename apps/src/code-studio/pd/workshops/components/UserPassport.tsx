import {LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  OverlineThreeText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import style from './userPassport.module.scss';

const UserPassport: React.FunctionComponent<{
  displayName: string;
  givenName?: string;
  familyName?: string;
  email: string;
  schoolName?: string;
  returnToHref: string;
  className?: string;
}> = ({
  displayName,
  givenName,
  familyName,
  email,
  schoolName,
  returnToHref,
  className = '',
}) => {
  const RenderErrorMessage = (message: string) => {
    return (
      <span className={style.errorMessage}>
        <FontAwesomeV6Icon iconName="exclamation-circle" iconStyle="solid" />
        <BodyThreeText>{message}</BodyThreeText>
      </span>
    );
  };

  return (
    <div className={classNames(style.userInfoContainer, className)}>
      <span className={style.userInfoHeader}>
        <div className={style.displayName}>
          <FontAwesomeV6Icon iconName="user-circle" iconStyle="solid" />
          <BodyThreeText>{displayName}</BodyThreeText>
        </div>
        <LinkButton
          text="Edit"
          size="xs"
          iconLeft={{iconName: 'pencil', iconStyle: 'solid'}}
          className={style.editButton}
          href={`/users/edit?user_return_to=${returnToHref}`}
        />
      </span>
      <div className={style.userInfoContent}>
        <div className={style.userInfoRow}>
          <OverlineThreeText className={style.userInfoLabel}>
            Full name
          </OverlineThreeText>
          {givenName && familyName ? (
            <BodyThreeText>{`${givenName} ${familyName}`}</BodyThreeText>
          ) : (
            RenderErrorMessage('Add your full name')
          )}
        </div>
        <div className={style.userInfoRow}>
          <OverlineThreeText className={style.userInfoLabel}>
            Email
          </OverlineThreeText>
          <BodyThreeText>{email}</BodyThreeText>
        </div>
        <div className={style.userInfoRow}>
          <OverlineThreeText className={style.userInfoLabel}>
            School
          </OverlineThreeText>
          {schoolName ? (
            <BodyThreeText>{schoolName}</BodyThreeText>
          ) : (
            RenderErrorMessage('Add your school')
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPassport;
