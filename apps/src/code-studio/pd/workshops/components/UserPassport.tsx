import {LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  OverlineThreeText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import {AccountSettingsSectionUrlParams} from '@cdo/apps/accounts/accountUpdateConstants';
import {UserInfoForWorkshop} from '@cdo/apps/code-studio/pd/workshops/types';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

import style from './userPassport.module.scss';

export const isMissingUserInfo = (
  userInfo: UserInfoForWorkshop['userInfo']
) => {
  return (
    !userInfo ||
    !userInfo.givenName ||
    !userInfo.familyName ||
    !userInfo.email ||
    !userInfo.educatorRole ||
    (!userInfo.schoolInfo?.schoolName && !userInfo.schoolInfo?.schoolType)
  );
};

const UserPassport: React.FunctionComponent<{
  displayName: string;
  givenName?: string;
  familyName?: string;
  email: string;
  educatorRole?: string;
  schoolName?: string;
  schoolType?: string;
  returnToHref: string;
  className?: string;
}> = ({
  displayName,
  givenName,
  familyName,
  email,
  educatorRole,
  schoolName,
  schoolType,
  returnToHref,
  className = '',
}) => {
  const listedSchoolName =
    schoolType === NonSchoolOptions.NO_SCHOOL_SETTING
      ? 'Non-School Setting'
      : schoolName;

  const RenderErrorMessage = (message: string) => {
    return (
      <span className={style.errorMessage}>
        <FontAwesomeV6Icon iconName="exclamation-circle" iconStyle="solid" />
        <BodyThreeText>{message}</BodyThreeText>
      </span>
    );
  };

  const buildEditLink = () => {
    let editLink = `/users/edit?user_return_to=${encodeURIComponent(
      returnToHref
    )}`;

    if (!givenName || !familyName || !educatorRole) {
      editLink += `&${AccountSettingsSectionUrlParams.AccountInformation}=true`;
    }
    if (!schoolName && !schoolType) {
      editLink += `&${AccountSettingsSectionUrlParams.SchoolInformation}=true`;
    }

    return editLink;
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
          href={buildEditLink()}
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
            Role
          </OverlineThreeText>
          {educatorRole ? (
            <BodyThreeText>{educatorRole}</BodyThreeText>
          ) : (
            RenderErrorMessage('Add your role')
          )}
        </div>
        <div className={style.userInfoRow}>
          <OverlineThreeText className={style.userInfoLabel}>
            School
          </OverlineThreeText>
          {schoolName || schoolType ? (
            <BodyThreeText>{listedSchoolName}</BodyThreeText>
          ) : (
            RenderErrorMessage('Add your school')
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPassport;
