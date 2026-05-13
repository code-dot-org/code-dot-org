import Modal from '@code-dot-org/component-library/modal';
import TextField from '@code-dot-org/component-library/textField';
import {Typography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useEffect, useCallback, useMemo, useState} from 'react';

import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
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
      analyticsReporter.sendEvent(EVENTS.REGIONAL_WS_CATALOG_PAGE_VISITED, {
        'zip code': null,
        'regional partner': null,
        'number of regional workshops': 0,
        'number of national workshops': nationalWorkshops?.length || 0,
      });
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
            }
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
        <Typography variant="h2" gutterBottom>
          Upcoming local workshops
        </Typography>
        <Typography variant="body2" gutterBottom>
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
        </Typography>
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
              <Typography variant="h2" gutterBottom>
                Enter zip code to see workshops
              </Typography>
              <Typography variant="body2" gutterBottom>
                To see upcoming workshops in your area, you'll need to provide
                your zip code so we can match you with your regional partner.
                You can still enroll for national workshops below.
              </Typography>
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
              <MuiButton
                variant="contained"
                color="primary"
                size="medium"
                onClick={() => handleSubmitZip(zipCode, false)}
                type="button"
              >
                {'Submit'}
              </MuiButton>
            </div>
          </div>
        </>
      );
    } else if (showInvalidZipMessage) {
      return (
        <div className={style.bodyContainerHeaderText}>
          <Typography variant="h2" gutterBottom>
            Invalid zip entered
          </Typography>
          <Typography variant="body2" gutterBottom>
            We are unable to find your zip, you can try again or register for
            National Workshops.
          </Typography>
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
              <Typography variant="h2" gutterBottom>
                No workshops found
              </Typography>
              <Typography variant="body2" gutterBottom>
                We didn't find any upcoming workshops in your area. Workshops
                are being added all the time. Check back again soon or contact
                your regional partner for more information on upcoming
                workshops.
              </Typography>
            </div>
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              href={`/professional-learning/contact-regional-partner?zip=${zipCode}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {'Contact regional partner'}
            </MuiButton>
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
            children: 'Return to workshops',
            onClick: () => setShowRPInfoDialog(false),
          }}
        />
      )}
      <section className={style.headerContainer}>
        <div className={style.headerText}>
          <Typography variant="h1" gutterBottom>
            Find Code.org workshops near you
          </Typography>
          <Typography variant="body2" gutterBottom>
            Enter your school ZIP code to explore local professional learning
            workshops, and connect with your regional partner.{' '}
            <a href={'#nationalWorkshopContainer'}>National workshops</a> are
            available to teachers nationwide.
          </Typography>
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
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              loading={isSubmitting}
              onClick={() => handleSubmitZip(zipCode, false)}
              aria-label="submitZip"
              type="button"
            >
              {'Submit'}
            </MuiButton>
          </div>
          <div className={style.rpInfoContainer}>
            <Typography
              className={style.rpInfoHeader}
              variant="overline2"
              gutterBottom
            >
              Your Regional Partner
            </Typography>
            <div className={style.rpInfo}>
              <Typography
                className={
                  regionalPartnerName ? style.rpName : style.rpNameMissing
                }
                variant="body2"
                gutterBottom
              >
                {regionalPartnerText}
              </Typography>
              <div className={style.rpInfoButtons}>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  disabled={!regionalPartnerName}
                  onClick={() => setShowRPInfoDialog(true)}
                  aria-label="partnerInfo"
                  type="button"
                >
                  {'Partner info'}
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  disabled={!regionalPartnerName}
                  id="rpContactLink"
                  href={`/professional-learning/contact-regional-partner?zip=${zipCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {'Contact'}
                </MuiButton>
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
              <Typography variant="h2" gutterBottom>
                National workshops
              </Typography>
              <Typography variant="body2" gutterBottom>
                These workshops are managed by different regional partners, and
                are available to teachers nationwide.
              </Typography>
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
