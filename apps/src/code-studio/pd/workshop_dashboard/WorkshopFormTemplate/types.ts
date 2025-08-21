import {Dispatch} from 'react';

import {Option} from './components/MultiSelectInput';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig<T extends WorkshopFormState | SessionFormState> {
  required: boolean;
  stateKey: keyof T;
  label: string;
  helperMessage?: string;
  options?: FieldOption[];
}
export interface SessionFields {
  date: FieldConfig<SessionFormState>;
  start: FieldConfig<SessionFormState>;
  end: FieldConfig<SessionFormState>;
  session_format: FieldConfig<SessionFormState>;
  location_name?: FieldConfig<SessionFormState>;
  location_address?: FieldConfig<SessionFormState>;
  meeting_link?: FieldConfig<SessionFormState>;
}

export interface WorkshopFields {
  name?: FieldConfig<WorkshopFormState>;
  capacity?: FieldConfig<WorkshopFormState>;
  grades?: FieldConfig<WorkshopFormState>;
  description?: FieldConfig<WorkshopFormState>;
  notes?: FieldConfig<WorkshopFormState>;
  suppress_email?: FieldConfig<WorkshopFormState>;
  regional_partner_id?: FieldConfig<WorkshopFormState>;
  organizer_id?: FieldConfig<WorkshopFormState>;
  facilitators?: FieldConfig<WorkshopFormState>;
  subject?: FieldConfig<WorkshopFormState>;
  fee?: FieldConfig<WorkshopFormState>;
  prereq?: FieldConfig<WorkshopFormState>;
  hidden?: FieldConfig<WorkshopFormState>;
  registration_link?: FieldConfig<WorkshopFormState>;
  course_offerings?: FieldConfig<WorkshopFormState>;
  participant_group_type?: FieldConfig<WorkshopFormState>;
  time_zone?: FieldConfig<WorkshopFormState>;
}

export interface WorkshopCourseConfig {
  slug: string;
  label: string;
  session_fields: SessionFields;
  fields: WorkshopFields;
}

export interface WorkshopFormTemplateProps {
  config?: WorkshopCourseConfig;
  regionalPartnerData?: RegionalPartner[];
}

export interface Organizer {
  id: number;
  name: string;
  email: string;
}

export interface PotentialOrganizer {
  value: number;
  label: string;
}

export type SessionFormat = 'virtual' | 'in_person';

export interface Session {
  id: number;
  start: string;
  end: string;
  code: string;
  location_address: string | null;
  location_name: string | null;
  meeting_link: string | null;
  session_format: SessionFormat;
  'show_link?': boolean | null;
  attendance_count: number | null;
  is_local: boolean | null;
}

export interface SessionRequest
  extends Omit<
    Session,
    'id' | 'code' | 'show_link?' | 'attendance_count' | 'is_local'
  > {
  id?: number;
}

export interface DestroyedSession {
  id: number;
  _destroy: true;
}

export interface SessionFormState {
  id: string;
  date: string;
  start: string;
  end: string;
  locationAddress: string;
  locationName: string;
  meetingLink: string;
  format: SessionFormat;
}

export type WorkshopState = 'Not Started' | 'In Progress' | 'Ended';

export interface Workshop {
  id: number;
  course: string | null;
  name: string | null;
  capacity: number | null;
  grades: string[] | null;
  description: string | null;
  notes: string | null;
  suppress_email: boolean | null;
  regional_partner_id: number | null;
  organizer: Organizer | null;
  facilitators: Facilitator[];
  subject: string | null;
  fee: string | null;
  prereq: string | null;
  hidden: boolean | null;
  registration_link: string | null;
  sessions: Session[];
  course_offerings: number[];
  participant_group_type: string | null;
  time_zone: string | null;
  state: WorkshopState;
  enrolled_teacher_count: number | null;
  'ready_to_close?': boolean | null;
  'account_required_for_attendance?': boolean | null;
  regional_partner_name: string | null;
  course_offering_names: string | null;
  created_at: string;
}

export interface WorkshopRequest
  extends Omit<
    Workshop,
    | 'id'
    | 'facilitators'
    | 'organizer'
    | 'sessions'
    | 'state'
    | 'enrolled_teacher_count'
    | 'ready_to_close?'
    | 'account_required_for_attendance?'
    | 'regional_partner_name'
    | 'course_offering_names'
    | 'created_at'
  > {
  id?: number;
  facilitators: number[];
  organizer_id: number | null;
}

export interface Enrollment {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  district_name: string | null;
  school: string | null;
  role: string | null;
  user_id: number | null;
  user_info: {
    given_name: string | null;
    family_name: string | null;
    email: string;
    school_name: string | null;
    district_name: string | null;
    role: string | null;
  };
  attended: boolean;
  attendances: number;
  enrolled_date: string;
}

export interface EnrollmentData {
  id: number;
  givenName: string;
  familyName: string;
  email: string;
  schoolName: string;
  districtName: string;
  role: string;
  userId: number | null;
  attendances: number;
  enrolledDate: string;
}

export interface CourseOffering {
  id: number;
  display_name: string;
}

export interface RegionalPartner {
  id: number;
  name: string;
}

export interface Facilitator {
  id: number;
  name: string;
  email: string;
}

export interface WorkshopFormState {
  course: string;
  capacity: string;
  description: string;
  facilitators: Option[];
  fee: string;
  grades: string[];
  hidden: boolean;
  name: string;
  notes: string;
  organizerId: number | null;
  prereq: string;
  hasPrereq: boolean;
  regionalPartnerId: number | null;
  registrationLink: string;
  subject: string;
  suppressEmail: boolean;
  courseOfferings: string[];
  participantGroupType: string;
  timeZone: string;
}

export interface SectionProps {
  dispatchWorkshop: Dispatch<WorkshopAction>;
  config: WorkshopCourseConfig;
}

type BasicsKeys =
  | 'name'
  | 'grades'
  | 'subject'
  | 'prereq'
  | 'hasPrereq'
  | 'capacity'
  | 'description'
  | 'courseOfferings';

type PartnerFacilitatorKeys =
  | 'facilitators'
  | 'regionalPartnerId'
  | 'organizerId'
  | 'courseOfferings';

type AdditionalInfoKeys = 'fee' | 'participantGroupType' | 'notes';

type EmailsRemindersKeys = 'suppressEmail';

type PublishSettingsKeys = 'registrationLink' | 'hidden';

export type Errors<SectionKeys extends string> = Partial<
  Record<SectionKeys, string>
>;

export type SessionErrors = Partial<
  Record<SessionFormState['id'], Errors<keyof SessionFormState>>
>;

export type WorkshopErrors = Errors<keyof WorkshopFormState>;

export interface BasicsProps
  extends SectionProps,
    Pick<WorkshopFormState, BasicsKeys> {
  errors: WorkshopErrors;
}

export interface PartnerFacilitatorProps
  extends SectionProps,
    Pick<WorkshopFormState, PartnerFacilitatorKeys> {
  errors: WorkshopErrors;
}

export interface AdditionalInfoProps
  extends SectionProps,
    Pick<WorkshopFormState, AdditionalInfoKeys> {
  errors: WorkshopErrors;
}

export interface EmailsRemindersProps
  extends SectionProps,
    Pick<WorkshopFormState, EmailsRemindersKeys> {}

export interface PublishSettingsProps
  extends SectionProps,
    Pick<WorkshopFormState, PublishSettingsKeys> {
  errors: WorkshopErrors;
}

export interface ScheduleProps
  extends SectionProps,
    Pick<WorkshopFormState, 'timeZone'> {
  sessions: SessionFormState[];
  dispatchSessions: Dispatch<SessionAction>;
  errors: SessionErrors;
}

export interface PublishCancelButtonsProps {
  publish: () => void;
  cancel: () => void;
  loading: boolean;
}

export type SessionAction =
  | {type: 'ADD_SESSION'}
  | {type: 'UPDATE_SESSION'; payload: Partial<SessionFormState>; id: string}
  | {type: 'SET_SESSIONS'; payload: SessionFormState[]}
  | {type: 'DELETE_SESSION'; id: string};

export type WorkshopAction =
  | {type: 'UPDATE_WORKSHOP'; payload: Partial<WorkshopFormState>}
  | {type: 'ADD_GRADE'; payload: string}
  | {type: 'REMOVE_GRADE'; payload: string}
  | {type: 'ADD_COURSE_OFFERING'; payload: string}
  | {type: 'REMOVE_COURSE_OFFERING'; payload: string}
  | {type: 'SET_COURSE_OFFERINGS'; payload: string[]}
  | {type: 'SET_WORKSHOP'; payload: WorkshopFormState};

// Survey summary API response types
export interface SurveySummary {
  course: string;
  name: string;
  facilitators: Record<string, string>;
  surveys: Record<string, SurveyTypeSummary>;
}

export interface SurveyTypeSummary {
  total_responses: number;
  categories: SurveyCategories;
}

export interface SurveyCategories {
  implementation?: SurveyCategory;
  engagement?: SurveyCategory;
  logistics?: SurveyCategory;
  other?: SurveyCategory;
  facilitator?: Record<string, FacilitatorCategory>;
}

export interface SurveyCategory {
  questions: SurveyQuestions;
}

export type SurveyQuestions = Record<string, SurveyQuestion>;

export interface FacilitatorCategory {
  name: string;
  questions: SurveyQuestions;
}

type SurveyQuestionBase = {
  question_name: string;
  question_text: string;
  question_short_text: string | null;
  question_sub_text: string | null;
  category: string | null;
};

type ResultsBase = {
  total_responses?: number;
};

export type SurveyQuestion =
  | (SurveyQuestionBase & {
      question_type: 'likert';
      results: ResultsBase & LikertResults;
    })
  | (SurveyQuestionBase & {
      question_type: 'promoter';
      results: ResultsBase & PromoterResults;
    })
  | (SurveyQuestionBase & {
      question_type: 'text';
      results: ResultsBase & TextResults;
    })
  | (SurveyQuestionBase & {
      question_type: 'singleSelect';
      results: ResultsBase & SingleSelectResults;
    })
  | (SurveyQuestionBase & {
      question_type: 'multiSelect';
      results: MultiSelectResults;
    });

export const isQuestionType = <T extends SurveyQuestion['question_type']>(
  question: SurveyQuestion | undefined,
  type: T
): question is Extract<SurveyQuestion, {question_type: T}> => {
  return !!question && question.question_type === type;
};

export interface LikertResults {
  weighted_score: number;
  agreement_count: number;
  agreement_percentage: number;
  breakdown: Record<string, LikertBreakdown>;
}

export interface LikertBreakdown {
  count: number;
  percentage: number;
  label: string;
  weighted_value: number;
}

export interface PromoterResults {
  promoter_percentage: number;
  breakdown: Record<string, PromoterBreakdown>;
}

export interface PromoterBreakdown {
  count: number;
  percentage: number;
  label: string;
}

export interface TextResults {
  responses: string[];
}

export interface SingleSelectResults {
  breakdown: Record<string, SingleSelectBreakdown>;
  other_answers?: string[];
}

export interface SingleSelectBreakdown {
  count: number;
  percentage: number;
  label: string;
}

export interface MultiSelectResults {
  breakdown: Record<string, MultiSelectBreakdown>;
  total_respondents: number;
}

export interface MultiSelectBreakdown {
  count: number;
  percentage: number;
  label: string;
}
