import {SegmentedButtonsProps} from '@code-dot-org/component-library/segmentedButtons';

import {SessionFormat, WorkshopState} from '../WorkshopFormTemplate/types';

export interface WorkshopSession {
  id: number;
  start: string;
  end: string;
  sessionFormat: SessionFormat | null;
  locationName: string | null;
  locationAddress: string | null;
  meetingLink: string | null;
  code: string | null;
  showLink: boolean;
  attendanceCount: number | null;
}

export interface WorkshopFacilitator {
  id: number;
  name: string;
  email: string;
}

export interface WorkshopData {
  id: number;
  state: WorkshopState;
  timeZone: string | null;
  name: string | null;
  course: string | null;
  subject: string | null;
  courseOfferingNames: string | null;
  sessions: WorkshopSession[];
  facilitators: WorkshopFacilitator[];
  regionalPartnerName: string | null;
  accountRequiredForAttendance: boolean;
  readyToClose: boolean;
  registrationLink: string | null;
  createdAt: string | null;
  enrolledTeacherCount: number | null;
  hidden: boolean | null;
}

export interface WorkshopContextValue {
  workshop: WorkshopData | null;
  loading: boolean;
  error: Error | string | null;
  loadWorkshop: () => void;
}

export interface TabConfig {
  label: string;
  path?: string;
}

export interface SurveyOption {
  text: string;
  value: string;
}

export interface WorkshopTabsProps {
  tabList: TabConfig[];
}

export interface SurveyTypeSelectionProps {
  surveyTypeOptions: SurveyOption[];
}

export interface SurveyCategorySelectionProps {
  questionCategoryButtons: SegmentedButtonsProps['buttons'];
}

export type WorkshopLayoutProps = WorkshopTabsProps &
  SurveyTypeSelectionProps &
  SurveyCategorySelectionProps;
