import {SegmentedButtonsProps} from '@code-dot-org/component-library/segmentedButtons';
export interface WorkshopSession {
  id: string;
  start: string;
  end: string;
  sessionFormat: 'in_person' | 'virtual';
  locationName?: string;
  code?: string;
  showLink: boolean;
  attendanceCount: number;
}

export interface WorkshopFacilitator {
  id: string;
  name: string;
  email: string;
}

export interface WorkshopData {
  id: string;
  state: 'Not Started' | 'In Progress' | 'Ended';
  timeZone: string;
  name: string;
  course: string;
  subject: string;
  courseOfferingNames: string;
  sessions: WorkshopSession[];
  facilitators: WorkshopFacilitator[];
  regionalPartnerName: string;
  accountRequiredForAttendance: boolean;
  readyToClose: boolean;
  registrationLink?: string;
  createdAt: string;
  enrolledTeacherCount?: number;
  hidden?: boolean;
}

export interface EnrollmentData {
  id: string;
  name: string;
  email: string;
}

export interface WorkshopContextValue {
  workshop: WorkshopData | null;
  enrollments: EnrollmentData[] | null;
  loading: boolean;
  loadingEnrollments: boolean;
  error: string | null;
  loadWorkshop: () => void;
  loadEnrollments: () => void;
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
