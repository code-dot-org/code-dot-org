import React from 'react';
import {JsonLd} from 'react-schemaorg';
import type {
  EducationEvent,
  EventStatusType,
  Offer,
  Place,
  VirtualLocation,
  Organization,
  ItemAvailability,
} from 'schema-dts';

import {WorkshopFormats} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import type {WorkshopInfo, OrganizerInfo, SessionInfo} from './../types';

const EVENT_ATTENDANCE_MODES = {
  in_person: 'https://schema.org/OfflineEventAttendanceMode',
  hybrid: 'https://schema.org/MixedEventAttendanceMode',
  virtual: 'https://schema.org/OnlineEventAttendanceMode',
} as const;

const EVENT_STATUSES = {
  Scheduled: 'https://schema.org/EventScheduled',
  Cancelled: 'https://schema.org/EventCancelled',
  Postponed: 'https://schema.org/EventPostponed',
  Rescheduled: 'https://schema.org/EventRescheduled',
  MovedOnline: 'https://schema.org/EventMovedOnline',
} as const;

// Prevent any issues with hash fragments in URLs
const getPageUrl = (): string => window.location.href.split('#')[0];

const getWorkshopDates = (sessions: SessionInfo[]) => {
  if (!sessions?.length) return {startDate: undefined, endDate: undefined};

  const sortedSessions = sessions
    .slice()
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return {
    startDate: sortedSessions[0]?.start,
    endDate: sortedSessions[sortedSessions.length - 1]?.end,
  };
};

const getAvailability = (
  capacity: number,
  num_enrollments: number
): ItemAvailability => {
  if (capacity > 0 && num_enrollments >= capacity) {
    return 'https://schema.org/SoldOut';
  }
  return 'https://schema.org/InStock';
};

const determineWorkshopLocationName = (
  format: keyof typeof WorkshopFormats,
  location_name?: string,
  sessions?: SessionInfo[]
): string => {
  if (format === 'virtual') {
    return '';
  }

  // priority 1: check sessions first
  if (sessions && sessions.length > 0) {
    const locationNames = sessions
      .map(session => session.location_name?.trim())
      .filter((name): name is string => Boolean(name));

    const uniqueLocations = Array.from(new Set(locationNames));

    if (uniqueLocations.length === 1) {
      return uniqueLocations[0];
    }
    if (uniqueLocations.length > 1) {
      return 'Location varies by session';
    }
  }

  // priority 2: fallback to workshop-level location_name
  if (location_name?.trim()) {
    return location_name.trim();
  }

  // priority 3: final fallback
  return 'Location To Be Determined';
};

const getLocation = (
  format: keyof typeof WorkshopFormats,
  location_name?: string,
  sessions?: SessionInfo[]
): Place | VirtualLocation => {
  if (format === 'virtual') {
    return {
      '@type': 'VirtualLocation',
      url: getPageUrl(),
    };
  }

  return {
    '@type': 'Place',
    name: determineWorkshopLocationName(format, location_name, sessions),
  };
};

const parseFee = (fee?: string): number => {
  const parsed = Number(fee);
  return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
};

const getOffer = (
  fee?: string,
  capacity?: number,
  num_enrollments?: number
): {offer: Offer; priceNumber: number} => {
  const priceNumber = parseFee(fee);

  const offer: Offer = {
    '@type': 'Offer',
    price: priceNumber,
    priceCurrency: 'USD',
    availability: getAvailability(capacity ?? 0, num_enrollments ?? 0),
    url: getPageUrl(),
  };

  return {offer, priceNumber};
};

const getOrganizer = (
  organizer?: OrganizerInfo,
  regional_partner_name?: string
): Organization => {
  return {
    '@type': 'Organization',
    name: organizer?.name || regional_partner_name || 'Code.org',
    email: organizer?.email,
  };
};

const getKeywords = (
  course?: string,
  subject?: string,
  course_offerings?: string[]
): string | undefined => {
  const keywords = [course, subject, ...(course_offerings ?? [])].filter(
    Boolean
  );
  return keywords.length ? keywords.join(', ') : undefined;
};

const summarizeGradeLevels = (grade_levels?: string[]): string | undefined => {
  if (!grade_levels?.length) return undefined;

  const grades = grade_levels.map(g => g.trim().toUpperCase());
  const hasKindergarten = grades.includes('K');
  const numericGrades = grades
    .filter(g => g !== 'K')
    .map(Number)
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  let numericPart = '';
  if (numericGrades.length === 1) {
    numericPart = `Grade ${numericGrades[0]}`;
  } else if (numericGrades.length > 1) {
    numericPart = `Grades ${numericGrades[0]}-${
      numericGrades[numericGrades.length - 1]
    }`;
  }

  if (hasKindergarten && numericPart) {
    return `Kindergarten, ${numericPart}`;
  } else if (hasKindergarten) {
    return 'Kindergarten';
  } else {
    return numericPart || undefined;
  }
};

const getAudience = (grade_levels?: string[]) => {
  const summarized = summarizeGradeLevels(grade_levels);
  return summarized
    ? ({
        '@type': 'EducationalAudience',
        name: summarized,
      } as const)
    : undefined;
};

const WorkshopEventJsonLdData: React.FC<WorkshopInfo> = ({
  name,
  description,
  sessions,
  format,
  locationName,
  fee,
  capacity,
  numEnrollments,
  organizer,
  regionalPartnerName,
  gradeLevels,
  course,
  subject,
  courseOfferings,
}) => {
  const {startDate, endDate} = getWorkshopDates(sessions);
  const {offer, priceNumber} = getOffer(fee, capacity, numEnrollments);

  return (
    <JsonLd<EducationEvent>
      item={{
        '@context': 'https://schema.org',
        '@type': 'EducationEvent',
        name,
        startDate,
        endDate,
        description,
        eventAttendanceMode: EVENT_ATTENDANCE_MODES[format],
        eventStatus: EVENT_STATUSES.Scheduled as EventStatusType,
        location: getLocation(format, locationName, sessions),
        organizer: getOrganizer(organizer, regionalPartnerName),
        offers: offer,
        isAccessibleForFree: priceNumber === 0 ? true : undefined,
        audience: getAudience(gradeLevels),
        keywords: getKeywords(course, subject, courseOfferings),
        url: getPageUrl(),
      }}
    />
  );
};

export default WorkshopEventJsonLdData;
