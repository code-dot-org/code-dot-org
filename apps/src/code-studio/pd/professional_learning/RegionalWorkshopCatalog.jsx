import {Button, LinkButton} from '@code-dot-org/component-library/button';
import Modal from '@code-dot-org/component-library/modal';
import TextField from '@code-dot-org/component-library/textField';
import {
  Heading1,
  Heading2,
  BodyTwoText,
  OverlineTwoText,
} from '@code-dot-org/component-library/typography';
import PropTypes from 'prop-types';
import React, {useEffect, useCallback, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import CalendarEmptyStateIllustration from '@cdo/apps/templates/teacherNavigation/images/CalendarEmptyStateIllustration.svg';
import CalendarNotAvailable from '@cdo/apps/templates/teacherNavigation/images/CalendarNotAvailable.svg';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import style from './regionalWorkshopCatalog.module.scss';

export default function RegionalWorkshopCatalog({zipFromSchoolInfo}) {
  const [zipCode, setZipCode] = useState('');
  const [hasSubmittedZip, setHasSubmittedZip] = useState(false);
  const [regionalPartnerText, setRegionalPartnerText] =
    useState('Zip code required');
  const [regionalPartnerName, setRegionalPartnerName] = useState('');
  const [regionalPartnerInfo, setRegionalPartnerInfo] = useState('');
  const [showRPInfoDialog, setShowRPInfoDialog] = useState(false);
  const [availableWorkshops, setAvailableWorkshops] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load workshops for the given zip if one is present in the URL or is passed in as a prop
  useEffect(() => {
    const zipFromUrl = queryParams()['zip'];
    const prepopulatedZip = zipFromUrl ? zipFromUrl : zipFromSchoolInfo;
    if (prepopulatedZip) {
      setZipCode(prepopulatedZip);
      handleSubmitZip(prepopulatedZip);
    }
  }, [zipFromSchoolInfo, handleSubmitZip]);

  const handleSubmitZip = useCallback(
    async submittedZip => {
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(`regional_workshop_data/${submittedZip}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
        });

        if (response.ok) {
          const jsonData = await response.json();
          const regionalPartner =
            jsonData.regional_workshop_data.regional_partner;
          if (regionalPartner.name) {
            setRegionalPartnerText(regionalPartner.name);
            setRegionalPartnerName(regionalPartner.name);
            setRegionalPartnerInfo(regionalPartner.additional_info);
          } else {
            setRegionalPartnerText('No regional partner found');
            setRegionalPartnerName('');
            setRegionalPartnerInfo('');
          }
          setAvailableWorkshops(
            jsonData.regional_workshop_data.available_workshops
          );
          setHasSubmittedZip(true);
        }
      } catch (error) {
        console.error(
          'Error fetching regional partner and available workshops:',
          error
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  const RenderWorkshopContent = () => {
    if (!hasSubmittedZip) {
      return (
        <div className={style.noCardsContainer}>
          <img id="enter-zip-img" src={CalendarEmptyStateIllustration} alt="" />
          <div className={style.noCardsTextContainer}>
            <Heading2>Enter zip code to see workshops</Heading2>
            <BodyTwoText>
              To see available workshops, please provide your zip code. National
              workshops are available for all teachers, but we'll use your zip
              to match you with a regional partner and show you local workshops.
            </BodyTwoText>
          </div>
          <div className={style.zipSearchInput}>
            <TextField
              id="noZipSearch"
              name="noZipSearch"
              aria-label="zipCode"
              onChange={e => setZipCode(e.target.value)}
              value={zipCode}
              maxLength={255}
              placeholder="12345"
            />
            <Button
              text="Submit"
              color="purple"
              onClick={() => handleSubmitZip(zipCode)}
            />
          </div>
        </div>
      );
    } else if (!availableWorkshops || availableWorkshops.length === 0) {
      return (
        <div className={style.noCardsContainer}>
          <img id="no-workshops-found-img" src={CalendarNotAvailable} alt="" />
          <div className={style.noCardsTextContainer}>
            <Heading2>No workshops found</Heading2>
            <BodyTwoText>
              We didn't find any upcoming workshops in your area. Workshops are
              being added all the time. Check back again soon or contact your
              regional partner for more information on upcoming workshops.
            </BodyTwoText>
          </div>
          <LinkButton
            text="Contact regional partner"
            target="_blank"
            color="purple"
            href={`/professional-learning/contact-regional-partner?zip=${zipCode}`}
          />
        </div>
      );
    } else {
      return (
        <div className={style.withWsCardsContainer}>
          <Heading2>Upcoming workshops</Heading2>
          <BodyTwoText>
            Workshops are always being added. If you do not see the workshop you
            are looking for check back again soon or{' '}
            <a
              className={style.linkText}
              href={`/professional-learning/contact-regional-partner?zip=${zipCode}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              contact your Regional Partner
            </a>
            {'.'}
          </BodyTwoText>
          {availableWorkshops && (
            <div>
              <ul>
                {availableWorkshops.map(workshop => (
                  <li key={workshop.id}>{`Id: ${workshop.id}, Title: ${
                    workshop.name
                      ? workshop.name
                      : workshop.course + ' - ' + workshop.subject
                  }, Location: ${
                    workshop.location_name
                  }, Participant Group Type: ${
                    workshop.participant_group_type
                  }`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className={style.workshopCatalog}>
      {showRPInfoDialog && (
        <Modal
          title={regionalPartnerName}
          description={regionalPartnerInfo}
          primaryButtonProps={{
            text: 'Return to workshops',
            onClick: () => setShowRPInfoDialog(false),
          }}
        />
      )}
      <section className={style.headerContainer}>
        <div className={style.headerText}>
          <Heading1>Find your local workshop and apply</Heading1>
          <BodyTwoText>
            Look up details of the Professional Learning Program in your region
            by submitting your zip code.
          </BodyTwoText>
        </div>
        <div className={style.zipSearchContainer}>
          <div className={style.zipSearchInput}>
            <TextField
              id="zipSearch"
              name="zipSearch"
              aria-label="zipSearch"
              label="School ZIP Code:"
              onChange={e => setZipCode(e.target.value)}
              value={zipCode}
              maxLength={255}
              placeholder="12345"
            />
            <Button
              aria-label="submitZip"
              text="Submit"
              color="purple"
              onClick={() => handleSubmitZip(zipCode)}
              isPending={isSubmitting}
            />
          </div>
          <div className={style.rpInfoContainer}>
            <OverlineTwoText className={style.rpInfoHeader}>
              Your Regional Partner
            </OverlineTwoText>
            <div className={style.rpInfo}>
              <BodyTwoText
                className={
                  regionalPartnerName ? style.rpName : style.rpNameMissing
                }
              >
                {regionalPartnerText}
              </BodyTwoText>
              <div className={style.rpInfoButtons}>
                <Button
                  aria-label="partnerInfo"
                  text="Partner info"
                  color="black"
                  type="secondary"
                  size="xs"
                  onClick={() => setShowRPInfoDialog(true)}
                  disabled={!regionalPartnerName}
                />
                <LinkButton
                  text="Contact"
                  target="_blank"
                  color="black"
                  type="secondary"
                  size="xs"
                  href={`/professional-learning/contact-regional-partner?zip=${zipCode}`}
                  disabled={!regionalPartnerName}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={style.workshopContainer}>
        {RenderWorkshopContent()}
      </section>
    </div>
  );
}

RegionalWorkshopCatalog.propTypes = {
  zipFromSchoolInfo: PropTypes.string,
};
