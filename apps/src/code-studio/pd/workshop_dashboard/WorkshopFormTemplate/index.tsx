import React, {FC, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {
  Session,
  SessionFormState,
  Workshop,
  WorkshopCourseConfig,
  WorkshopFormState,
} from './types';

export const workshopDataToState = (data: Workshop): WorkshopFormState => ({
  course: data.course ?? null,
  capacity: data.capacity ?? null,
  description: data.description ?? null,
  facilitators: data.facilitators ?? [],
  fee: data.fee ?? null,
  grades: data.grades ?? [],
  hidden: data.hidden ?? null,
  name: data.name ?? null,
  notes: data.notes ?? null,
  organizerId: data.organizer?.id ?? null,
  prereq: data.prereq ?? null,
  regionalPartnerId: data.regional_partner_id ?? null,
  registrationLink: data.registration_link ?? null,
  subject: data.subject ?? null,
  suppressEmail: data.suppress_email ?? null,
  courseOfferings: data.course_offerings ?? [],
  participantGroupType: data.participant_group_type ?? null,
  timeZone: data.time_zone ?? null,
});

export const sessionDataToState = (data: Session[]): SessionFormState[] =>
  data.map(session => ({
    id: session.id ?? null,
    start: session.start ?? null,
    end: session.end ?? null,
    code: session.code ?? null,
    locationAddress: session.location_address ?? null,
    locationName: session.location_name ?? null,
    meetingLink: session.meeting_link ?? null,
    sessionFormat: session.session_format ?? null,
  }));

export const WorkshopFormTemplate: FC<WorkshopCourseConfig> = ({
  slug,
  label,
  session_fields,
  fields,
}) => {
  const {workshopId} = useParams();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formState, setFormState] = useState<WorkshopFormState>({
    course: null,
    capacity: null,
    description: null,
    facilitators: [],
    fee: null,
    grades: [],
    hidden: false,
    name: null,
    notes: null,
    organizerId: null,
    prereq: null,
    regionalPartnerId: null,
    registrationLink: null,
    subject: null,
    suppressEmail: false,
    courseOfferings: [],
    participantGroupType: null,
    timeZone: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessions, setSessions] = useState<SessionFormState[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!workshopId) return;
    const fetchWorkshop = async () => {
      const response = await fetch(`/api/v1/pd/workshops/${workshopId}`);
      if (response.ok) {
        const data = await response.json();
        if (mounted) {
          setFormState(workshopDataToState(data));
          setSessions(sessionDataToState(data.sessions));
        }
      }
    };

    fetchWorkshop();

    return () => {
      mounted = false;
    };
  }, [workshopId]);

  return <h1>{label}</h1>;
};
