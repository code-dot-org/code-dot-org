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
import React, {useEffect, useCallback, useMemo, useState} from 'react';

import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {ZIP_REGEX} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import CalendarEmptyStateIllustration from '@cdo/apps/templates/teacherNavigation/images/CalendarEmptyStateIllustration.svg';
import CalendarNotAvailable from '@cdo/apps/templates/teacherNavigation/images/CalendarNotAvailable.svg';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import RegionalWorkshopCatalogCard from './RegionalWorkshopCatalogCard';

import style from './regionalWorkshopCatalog.module.scss';

export default function RegionalWorkshopCatalog({
  nationalWorkshops,
  zipFromSchoolInfo,
}) {
  const [zipCode, setZipCode] = useState('');
  const [showInvalidZipMessage, setShowInvalidZipMessage] = useState(false);
  const [hasSubmittedZip, setHasSubmittedZip] = useState(false);
  const [regionalPartnerText, setRegionalPartnerText] =
    useState('Zip code required');
  const [regionalPartnerName, setRegionalPartnerName] = useState('');
  const [regionalPartnerInfo, setRegionalPartnerInfo] = useState('');
  const [showRPInfoDialog, setShowRPInfoDialog] = useState(false);
  const [availableRegionalWorkshops, setAvailableRegionalWorkshops] = useState(
    []
  );
  // Don't show national workshops run by the given regional partner under
  // the "National workshops" section since they'll show up under the
  // "Upcoming local workshops" section.
  const availableNationalWorkshops = useMemo(() => {
    if (!availableRegionalWorkshops) {
      return nationalWorkshops;
    }
    const availableRegionalWorkshopIds = new Set(
      availableRegionalWorkshops.map(ws => ws.id)
    );
    return nationalWorkshops?.filter(
      ws => !availableRegionalWorkshopIds.has(ws.id)
    );
  }, [nationalWorkshops, availableRegionalWorkshops]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load workshops for the given zip if one is present in the URL or is passed in as a prop
  useEffect(() => {
    const zipFromUrl = queryParams()['zip'];
    const prepopulatedZip = zipFromUrl ? zipFromUrl : zipFromSchoolInfo;
    if (prepopulatedZip && ZIP_REGEX.test(prepopulatedZip)) {
      setZipCode(prepopulatedZip);
      handleSubmitZip(prepopulatedZip, true);
    } else {
      // Log page visit event with null info if there's no valid prepopulated zip
      analyticsReporter.sendEvent(
        EVENTS.REGIONAL_WS_CATALOG_PAGE_VISITED,
        {
          'zip code': null,
          'regional partner': null,
          'number of regional workshops': 0,
          'number of national workshops': nationalWorkshops?.length || 0,
        },
        PLATFORMS.BOTH
      );
    }
  }, [zipFromSchoolInfo, handleSubmitZip, nationalWorkshops]);

  const submitOnEnter = event => {
    if (event.key === 'Enter') {
      handleSubmitZip(zipCode, false);
    }
  };

  const handleSubmitZip = useCallback(
    async (submittedZip, prepopulatingZip) => {
      if (isSubmitting) {
        return;
      }

      setHasSubmittedZip(true);

      if (ZIP_REGEX.test(submittedZip)) {
        setShowInvalidZipMessage(false);
      } else {
        setShowInvalidZipMessage(true);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(true);
      try {
        updateQueryParam('zip', submittedZip, true);
        const response = await fetch(
          `/professional-learning/regional_workshop_data/${submittedZip}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': await getAuthenticityToken(),
            },
          }
        );

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

          const newRegionalWorkshops =
            jsonData.regional_workshop_data.available_regional_workshops;
          setAvailableRegionalWorkshops(newRegionalWorkshops);

          // Log regional partner and workshop data as the page visit event if
          // this query is triggered by a prepopulated zip (from the user info
          // or from a URL param), otherwise log the data as the zip enter event.
          analyticsReporter.sendEvent(
            prepopulatingZip
              ? EVENTS.REGIONAL_WS_CATALOG_PAGE_VISITED
              : EVENTS.REGIONAL_WS_CATALOG_ZIP_ENTERED,
            {
              'zip code': submittedZip,
              'regional partner': regionalPartner.name,
              'number of regional workshops': newRegionalWorkshops?.length || 0,
              'number of national workshops':
                availableNationalWorkshops?.length || 0,
            },
            PLATFORMS.BOTH
          );
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
    [isSubmitting, availableNationalWorkshops]
  );

  const RenderUpcomingLocalWorkshopsHeading = () => {
    return (
      <div className={style.bodyContainerHeaderText}>
        <Heading2>Upcoming local workshops</Heading2>
        <BodyTwoText>
          Workshops are always being added. Don't see the workshop you're
          looking for? Check back again or{' '}
          <a
            className={style.linkText}
            href={`/professional-learning/contact-regional-partner?zip=${zipCode}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            contact your regional partner
          </a>
          {'.'}
        </BodyTwoText>
      </div>
    );
  };

  const RenderRegionalWorkshops = () => {
    if (!hasSubmittedZip) {
      return (
        <>
          {RenderUpcomingLocalWorkshopsHeading()}
          <div className={style.noCardsContainer}>
            <img
              id="enter-zip-img"
              src={CalendarEmptyStateIllustration}
              alt=""
            />
            <div className={style.noCardsTextContainer}>
              <Heading2>Enter zip code to see workshops</Heading2>
              <BodyTwoText>
                To see upcoming workshops in your area, you'll need to provide
                your zip code so we can match you with your regional partner.
                You can still enroll for national workshops below.
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
                onClick={() => handleSubmitZip(zipCode, false)}
              />
            </div>
          </div>
        </>
      );
    } else if (showInvalidZipMessage) {
      return (
        <div className={style.bodyContainerHeaderText}>
          <Heading2>Invalid zip entered</Heading2>
          <BodyTwoText>
            We are unable to find your zip, you can try again or register for
            National Workshops.
          </BodyTwoText>
        </div>
      );
    } else if (
      !availableRegionalWorkshops ||
      availableRegionalWorkshops.length === 0
    ) {
      return (
        <>
          {RenderUpcomingLocalWorkshopsHeading()}
          <div className={style.noCardsContainer}>
            <img
              id="no-workshops-found-img"
              src={CalendarNotAvailable}
              alt=""
            />
            <div className={style.noCardsTextContainer}>
              <Heading2>No workshops found</Heading2>
              <BodyTwoText>
                We didn't find any upcoming workshops in your area. Workshops
                are being added all the time. Check back again soon or contact
                your regional partner for more information on upcoming
                workshops.
              </BodyTwoText>
            </div>
            <LinkButton
              text="Contact regional partner"
              target="_blank"
              color="purple"
              href={`/professional-learning/contact-regional-partner?zip=${zipCode}`}
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          {RenderUpcomingLocalWorkshopsHeading()}
          <div className={style.withWsCardsContainer}>
            {availableRegionalWorkshops &&
              WorkshopCardContainer(availableRegionalWorkshops)}
          </div>
        </>
      );
    }
  };

  const WorkshopCardContainer = workshops => (
    <div className={style.wsCardContainer}>
      {workshops.map(
        ({
          id,
          course,
          subject,
          name,
          capacity,
          num_enrollments,
          grade_levels,
          sessions,
          format,
          location_name,
          fee,
          has_prereq,
        }) => (
          <RegionalWorkshopCatalogCard
            id={id}
            key={id}
            course={course}
            subject={subject}
            name={name}
            capacity={capacity}
            numEnrollments={num_enrollments}
            supportedGradeLevels={grade_levels}
            sessions={sessions || []}
            format={format}
            locationName={location_name}
            fee={fee || ''}
            hasPrereq={has_prereq}
          />
        )
      )}
    </div>
  );

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
          <Heading1>Find Code.org workshops near you</Heading1>
          <BodyTwoText>
            Enter your school ZIP code to explore local professional learning
            workshops, and connect with your regional partner.{' '}
            <a href={'#nationalWorkshopContainer'}>National workshops</a> are
            available to teachers nationwide.
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
              onKeyDown={submitOnEnter}
              value={zipCode}
              maxLength={255}
              placeholder="12345"
              color="gray"
            />
            <Button
              aria-label="submitZip"
              text="Submit"
              color="purple"
              onClick={() => handleSubmitZip(zipCode, false)}
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
                  id="rpContactLink"
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
      <section className={style.regionalWorkshopContainer}>
        {RenderRegionalWorkshops()}
      </section>
      {availableNationalWorkshops && availableNationalWorkshops.length > 0 && (
        <section
          id="nationalWorkshopContainer"
          className={style.nationalWorkshopContainer}
        >
          <div className={style.withWsCardsContainer}>
            <div className={style.nationalWorkshopsHeader}>
              <Heading2>National workshops</Heading2>
              <BodyTwoText>
                These workshops are managed by different regional partners, and
                are available to teachers nationwide.
              </BodyTwoText>
            </div>
            {WorkshopCardContainer(availableNationalWorkshops)}
          </div>
        </section>
      )}
    </div>
  );
}

RegionalWorkshopCatalog.propTypes = {
  nationalWorkshops: PropTypes.arrayOf(PropTypes.object),
  zipFromSchoolInfo: PropTypes.string,
};
