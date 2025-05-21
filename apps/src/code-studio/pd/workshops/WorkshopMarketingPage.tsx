import {
  Heading1,
  Heading2,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import style from './workshopMarketingPage.module.scss';

interface SessionInfo {
  id: number;
  start: string;
  end: string;
  is_local: boolean;
  location_name?: string;
  location_address?: string;
  meeting_link?: string;
  session_format: string;
}

interface OrganizerInfo {
  name: string;
  email: string;
}

interface FacilitatorInfo {
  name: string;
  email: string;
  bio?: string;
}

const WorkshopMarketingPage: React.FunctionComponent<{
  id: number;
  course: string;
  subject?: string;
  course_offerings?: string[];
  name?: string;
  capacity: number;
  num_enrollments: number;
  grade_levels?: string[];
  sessions: SessionInfo[];
  format: string;
  location_name?: string;
  fee?: string;
  prereq?: string;
  description?: string;
  notes?: string;
  custom_registration_link?: string;
  regional_partner_name?: string;
  organizer: OrganizerInfo;
  facilitators?: FacilitatorInfo[];
}> = ({
  id,
  course,
  subject,
  course_offerings,
  name,
  capacity,
  num_enrollments,
  grade_levels,
  sessions,
  format,
  location_name,
  fee,
  prereq,
  description,
  notes,
  custom_registration_link,
  regional_partner_name,
  organizer,
  facilitators,
}) => {
  return (
    <div className={style.workshopCatalog}>
      <section className={style.headerContainer}>
        <Heading1>Register for a workshop</Heading1>
      </section>
      <section className={style.bodyContainer}>
        <div className={style.workshopInfoContainer}>
          <Heading2>Sample workshop title</Heading2>
          <BodyTwoText>Course: {course}</BodyTwoText>
          <BodyTwoText>Subject: {subject}</BodyTwoText>
          <BodyTwoText>
            PL Topics (course offerings): {course_offerings}
          </BodyTwoText>
          <BodyTwoText>Name: {name}</BodyTwoText>
          <BodyTwoText>Capacity: {capacity}</BodyTwoText>
          <BodyTwoText>Current # of enrollments: {num_enrollments}</BodyTwoText>
          <BodyTwoText>Grade levels: {grade_levels}</BodyTwoText>
          <BodyTwoText>Sessions:</BodyTwoText>
          {sessions.map(session => (
            <ul>
              <li>Id: {session.id}</li>
              <li>Start: {session.start}</li>
              <li>End: {session.end}</li>
              <li>Format: {session.session_format}</li>
              <li>Is local: {session.is_local}</li>
              <li>Location name: {session.location_name}</li>
              <li>Location address: {session.location_address}</li>
              <li>Meeting link: {session.meeting_link}</li>
            </ul>
          ))}
          <BodyTwoText>Format: {format}</BodyTwoText>
          <BodyTwoText>Location name: {location_name}</BodyTwoText>
          <BodyTwoText>Fee: {fee}</BodyTwoText>
          <BodyTwoText>Pre-requisites: {prereq}</BodyTwoText>
          <BodyTwoText>Description: {description}</BodyTwoText>
          <BodyTwoText>Notes: {notes}</BodyTwoText>
          <BodyTwoText>
            Custom registration link: {custom_registration_link}
          </BodyTwoText>
          <BodyTwoText>
            Regional Partner name: {regional_partner_name}
          </BodyTwoText>
          <BodyTwoText>Organizer info:</BodyTwoText>
          <ul>
            <li>Name: {organizer?.name}</li>
            <li>Email: {organizer?.email}</li>
          </ul>
          <BodyTwoText>Facilitators:</BodyTwoText>
          {facilitators?.map(facilitator => (
            <ul>
              <li>Name: {facilitator.name}</li>
              <li>Email: {facilitator.email}</li>
              <li>Bio: {facilitator.bio}</li>
            </ul>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WorkshopMarketingPage;
