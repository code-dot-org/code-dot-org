import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {Typography, Button as MuiButton} from '@mui/material';
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
  isUserEnrolled?: boolean;
}> = ({
  displayName,
  givenName,
  familyName,
  email,
  educatorRole,
  schoolName,
  schoolType,
  returnToHref,
  isUserEnrolled = false,
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
        <Typography variant="body3" gutterBottom>
          {message}
        </Typography>
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
      <span
        className={classNames(
          style.userInfoHeader,
          isUserEnrolled && style.enrolledUserInfoHeader
        )}
      >
        <div className={style.displayName}>
          <FontAwesomeV6Icon iconName="user-circle" iconStyle="solid" />
          <Typography variant="body3" gutterBottom>
            {displayName}
          </Typography>
        </div>
        {isUserEnrolled ? (
          <Tags
            className={style.enrolledTag}
            tagsList={[
              {label: 'Enrolled', icon: {iconName: 'check', placement: 'left'}},
            ]}
          />
        ) : (
          <MuiButton
            variant="contained"
            color="primary"
            size="extraSmall"
            className={style.editButton}
            href={buildEditLink()}
            startIcon={
              <FontAwesomeV6Icon iconName="pencil" iconStyle="solid" />
            }
          >
            {'Edit'}
          </MuiButton>
        )}
      </span>
      {!isUserEnrolled && (
        <div className={style.userInfoContent}>
          <div className={style.userInfoRow}>
            <Typography
              className={style.userInfoLabel}
              variant="overline3"
              gutterBottom
            >
              Full name
            </Typography>
            {givenName && familyName ? (
              <Typography
                variant="body3"
                gutterBottom
              >{`${givenName} ${familyName}`}</Typography>
            ) : (
              RenderErrorMessage('Add your full name')
            )}
          </div>
          <div className={style.userInfoRow}>
            <Typography
              className={style.userInfoLabel}
              variant="overline3"
              gutterBottom
            >
              Email
            </Typography>
            <Typography variant="body3" gutterBottom>
              {email}
            </Typography>
          </div>
          <div className={style.userInfoRow}>
            <Typography
              className={style.userInfoLabel}
              variant="overline3"
              gutterBottom
            >
              Role
            </Typography>
            {educatorRole ? (
              <Typography variant="body3" gutterBottom>
                {educatorRole}
              </Typography>
            ) : (
              RenderErrorMessage('Add your role')
            )}
          </div>
          <div className={style.userInfoRow}>
            <Typography
              className={style.userInfoLabel}
              variant="overline3"
              gutterBottom
            >
              School
            </Typography>
            {schoolName || schoolType ? (
              <Typography variant="body3" gutterBottom>
                {listedSchoolName}
              </Typography>
            ) : (
              RenderErrorMessage('Add your school')
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPassport;
