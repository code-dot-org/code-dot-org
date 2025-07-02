import {Button, buttonColors} from '@code-dot-org/component-library/button';
import Tags from '@code-dot-org/component-library/tags';
import {
  Heading5,
  BodyFourText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useState} from 'react';

import copyToClipboard from '@cdo/apps/util/copyToClipboard';

import WorkshopPanel from './WorkshopPanel';

import style from './workshopLinks.module.scss';

const CopyLinkButton: React.FunctionComponent<{link: string}> = ({link}) => {
  const [icon, setIcon] = useState('copy');

  return (
    <Button
      text="Copy link"
      size="xs"
      color={buttonColors.white}
      iconLeft={{iconName: icon, iconStyle: 'solid'}}
      className={style.copyLinkButton}
      onClick={() => copyToClipboard(link, () => setIcon('check'))}
    />
  );
};

const WorkshopLinks: React.FunctionComponent<{
  workshopId: number;
  hasCustomRegistrationLink: boolean;
}> = ({workshopId, hasCustomRegistrationLink}) => (
  <WorkshopPanel header="Your Workshop Links">
    <div className={style.linkColumnContainer}>
      <div className={classNames(style.linkColumn, style.firstLinkColumn)}>
        <div className={style.marketingColumnHeader}>
          <Heading5 className={style.headerText}>Marketing Page</Heading5>
          <Tags
            size="s"
            tagsList={[
              {
                key: 'eye-icon',
                label: 'Visible in catalog',
                icon: {
                  iconName: 'eye',
                  iconStyle: 'solid',
                  title: '',
                  placement: 'left',
                },
              },
            ]}
            className={style.eyeTag}
          />
        </div>
        <BodyFourText className={style.bodyText}>
          Share this page with teachers to promote your workshop. It includes
          key details and will guide them to the correct registration process.
        </BodyFourText>
        <div className={style.buttonContainer}>
          <a
            href={`${window.location.origin}/professional-learning/workshops/${workshopId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={style.workshopLink}
          >{`${window.location.origin}/professional-learning/workshops/${workshopId}`}</a>
          <CopyLinkButton
            link={`${window.location.origin}/professional-learning/workshops/${workshopId}`}
          />
        </div>
      </div>
      {hasCustomRegistrationLink && (
        <div className={classNames(style.linkColumn, style.secondLinkColumn)}>
          <Heading5 className={style.headerText}>Join Workshop Page</Heading5>
          <BodyFourText className={style.bodyText}>
            Participants must use this link to enroll in this workshop on
            Code.org after registering through your system. This ensures they're
            counted for attendance, surveys, and certificates.
          </BodyFourText>
          <div className={style.buttonContainer}>
            <a
              href={`${window.location.origin}/pd/workshops/${workshopId}/join`}
              target="_blank"
              rel="noopener noreferrer"
              className={style.workshopLink}
            >{`${window.location.origin}/pd/workshops/${workshopId}/join`}</a>
            <CopyLinkButton
              link={`${window.location.origin}/pd/workshops/${workshopId}/join`}
            />
          </div>
        </div>
      )}
    </div>
  </WorkshopPanel>
);

export default WorkshopLinks;
