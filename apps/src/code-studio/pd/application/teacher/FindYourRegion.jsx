import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
/* eslint-disable no-restricted-imports */
import {FormGroup, Modal, Button} from 'react-bootstrap';

/* eslint-enable no-restricted-imports */
import {
  PageLabels,
  SectionHeaders,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import {useRegionalPartner} from '../../components/useRegionalPartner';
import {FormContext} from '../../form_components_func/FormComponent';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';

import {getProgramInfo, styles} from './TeacherApplicationConstants';

const PD_RESOURCES_URL =
  'https://support.code.org/hc/en-us/articles/115003865532';
const CS_TEACHERS_URL = 'https://code.org/educate/community';
const INTERNATIONAL = 'Other country';
const US = 'United States';

const FindYourRegion = props => {
  const {onChange, data} = props;
  const hasNoProgramSelected = data.program === undefined;
  const resetCountry = () => onChange({country: US});
  const [regionalPartner] = useRegionalPartner(data);
  const [lastRPLogged, setLastRPLogged] = useState(regionalPartner?.name);

  const programInfo = getProgramInfo(data.program);

  useEffect(() => {
    onChange({
      regionalPartnerId: regionalPartner?.id,
      regionalPartnerGroup: regionalPartner?.group,
      regionalPartnerWorkshopIds: (regionalPartner?.workshops || []).map(
        workshop => workshop.id
      ),
    });

    // If Regional Partner changes, log their name:
    if (!regionalPartner?.name && lastRPLogged !== 'No Partner') {
      // Before school data is modified, log that they are not yet associated
      // with a Regional Partner.
      logRegionalPartnerFound('No Partner');
    } else if (
      regionalPartner?.name &&
      regionalPartner?.name !== lastRPLogged
    ) {
      // On a Regional Partner change, log the new Regional Partner's name.
      logRegionalPartnerFound(regionalPartner?.name);
    }
  }, [regionalPartner, data, lastRPLogged, onChange]);

  const logRegionalPartnerFound = name => {
    setLastRPLogged(name);
    analyticsReporter.sendEvent(EVENTS.RP_FOUND_EVENT, {
      'regional partner': name,
    });
  };

  const renderInternationalModal = () => {
    return (
      <Modal show={data.country === INTERNATIONAL}>
        <Modal.Header>
          <Modal.Title>
            Thank you for your interest in Code.org’s Professional Learning
            Program.
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          At this time, we are only able to provide this program to teachers in
          the United States. Please visit our website for additional Code.org{' '}
          <a href={PD_RESOURCES_URL} target="_blank" rel="noopener noreferrer">
            professional development resources
          </a>{' '}
          and opportunities to connect with other{' '}
          <a href={CS_TEACHERS_URL} target="_blank" rel="noopener noreferrer">
            computer science teachers
          </a>
          .
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={resetCountry} bsStyle="primary">
            Continue as United States Teacher
          </Button>
          <Button href={PD_RESOURCES_URL}>Exit Application</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const renderRegionalPartnerInfo = () => {
    let content;
    if (regionalPartner?.name) {
      content = (
        <>
          <p>
            Your Regional Partner will host the full professional learning
            program and provide ongoing support as you implement what you’ve
            learned in the classroom!
          </p>
          <p>
            <strong>Your Regional Partner is: {regionalPartner.name}</strong>
          </p>
        </>
      );
    } else {
      content = (
        <>
          <p>
            <strong>
              There is no Regional Partner in your region at this time
            </strong>
          </p>
          <p>
            Code.org will review your application and contact you with options
            for joining a virtual cohort of {programInfo.name} teachers from
            another region.
          </p>
        </>
      );
    }
    return (
      <>
        <p>
          Participants are assigned to a program hosted by one of our Regional
          Partners based on their school's geographic location.
        </p>
        {data.school && content}
      </>
    );
  };

  const renderContents = () => {
    if (hasNoProgramSelected) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 1 and select your program before completing
            this section.
          </p>
        </div>
      );
    } else {
      return (
        <>
          {renderInternationalModal()}
          {renderRegionalPartnerInfo()}
        </>
      );
    }
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.findYourRegion}>
        <FormGroup>
          <h3>Section 2: {SectionHeaders.findYourRegion}</h3>

          {renderContents()}
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};
FindYourRegion.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

FindYourRegion.associatedFields = [...Object.keys(PageLabels.findYourRegion)];

export default FindYourRegion;
