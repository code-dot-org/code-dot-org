import React, {FC, useEffect, useState} from 'react';

import {useWorkshop} from '../hooks/useWorkshop';

import {
  Session,
  SessionFormState,
  Workshop,
  WorkshopFormState,
  WorkshopFormTemplateProps,
} from './types';

export const workshopDataToState = (data: Workshop): WorkshopFormState => ({
  course: data.course ?? null,
  capacity: data.capacity ?? null,
  description: data.description ?? '',
  facilitators: data.facilitators ?? [],
  fee: data.fee ?? '',
  grades: data.grades ?? [],
  hidden: data.hidden ?? false,
  name: data.name ?? null,
  notes: data.notes ?? '',
  organizerId: data.organizer?.id,
  prereq: data.prereq ?? '',
  regionalPartnerId: data.regional_partner_id,
  registrationLink: data.registration_link ?? '',
  subject: data.subject ?? '',
  suppressEmail: data.suppress_email ?? false,
  courseOfferings: data.course_offerings ?? [],
  participantGroupType: data.participant_group_type ?? '',
  timeZone: data.time_zone ?? '',
});

export const sessionDataToState = (data: Session[]): SessionFormState[] =>
  data.map(session => ({
    id: session.id,
    start: session.start ?? '',
    end: session.end ?? '',
    code: session.code ?? '',
    locationAddress: session.location_address ?? '',
    locationName: session.location_name ?? '',
    meetingLink: session.meeting_link ?? '',
    sessionFormat: session.session_format ?? 'in_person',
  }));

export const WorkshopFormTemplate: FC<WorkshopFormTemplateProps> = ({
  config,
}) => {
  const {workshop} = useWorkshop();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [workshopFormState, setWorkshopFormState] = useState<WorkshopFormState>(
    {
      course: '',
      capacity: undefined,
      description: '',
      facilitators: [],
      fee: '',
      grades: [],
      hidden: false,
      name: '',
      notes: '',
      organizerId: undefined,
      prereq: '',
      regionalPartnerId: undefined,
      registrationLink: '',
      subject: '',
      suppressEmail: false,
      courseOfferings: [],
      participantGroupType: '',
      timeZone: '',
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessionFormState, setSessionFormState] = useState<SessionFormState[]>(
    []
  );

  useEffect(() => {
    if (workshop) {
      setWorkshopFormState(workshopDataToState(workshop));
      setSessionFormState(sessionDataToState(workshop.sessions));
    }
  }, [workshop]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = (key: string, value: unknown) => {
    setWorkshopFormState(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };
  return <h1>{config.label}</h1>;
};
