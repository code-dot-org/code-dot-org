// Ambient module declarations for @cdo/* imports retained in files moved from
// apps/.  These stubs let tsc resolve the modules without pulling in the apps
// monorepo. At runtime the Studio host provides the real implementations via
// webpack aliases.
//
// STUB — do not add business logic here.

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/HttpClient                                         */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/HttpClient' {
  export class NetworkError extends Error {
    response?: Response;
  }
  interface HttpClientStatic {
    fetchJson<T>(url: string, params?: object): Promise<{value: T}>;
    post(
      url: string,
      body?: string,
      useCredentials?: boolean,
      headers?: Record<string, string>,
    ): Promise<Response>;
    get(url: string): Promise<Response>;
    put(
      url: string,
      body: string,
      useCredentials: boolean,
      headers?: Record<string, string>,
    ): Promise<Response>;
  }
  const HttpClient: HttpClientStatic;
  export default HttpClient;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/reduxHooks                                         */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/reduxHooks' {
  import type {ThunkDispatch} from '@reduxjs/toolkit';
  import type {AnyAction} from 'redux';
  export type AppDispatch = ThunkDispatch<any, undefined, AnyAction>;
  export function useAppDispatch(): AppDispatch;
  export function useAppSelector<T>(selector: (state: any) => T): T;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/types/redux                                              */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/types/redux' {
  export type RootState = any;
  export interface Student {
    id: number;
    name: string;
    familyName: string;
    sectionId: number;
  }
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/redux                                                    */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/redux' {
  import type {Store} from 'redux';
  export function getStore(): Store;
  export function registerReducers(reducers: Record<string, any>): void;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/dcdo                                                     */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/dcdo' {
  interface DCDOStatic {
    get(key: string, defaultValue?: any): any;
  }
  const DCDO: DCDOStatic;
  export default DCDO;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/experiments                                         */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/experiments' {
  interface ExperimentsStatic {
    isEnabled(key: string): boolean;
  }
  const experiments: ExperimentsStatic;
  export default experiments;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/metrics/AnalyticsReporter                                */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/metrics/AnalyticsReporter' {
  interface AnalyticsReporterStatic {
    sendEvent(name: string, payload?: Record<string, any>): void;
  }
  const analyticsReporter: AnalyticsReporterStatic;
  export default analyticsReporter;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/metrics/AnalyticsConstants                               */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/metrics/AnalyticsConstants' {
  export const EVENTS: Record<string, string>;
}
declare module '@cdo/apps/metrics/AnalyticsConstants.js' {
  export const EVENTS: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/accounts/constants                                       */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/accounts/constants' {
  export const OAuthSectionTypes: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/generated/curriculum/sharedCourseConstants                */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/generated/curriculum/sharedCourseConstants' {
  export const ParticipantAudience: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/aichat/types/accessControls                              */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/aichat/types/accessControls' {
  export type AiChatAccessLevel = string;
  export type AiChatToolsDependencyValue = string;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/aichat/constants                                         */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/aichat/constants' {
  export const VERIFIED_TEACHER_SUPPORT_LINK: string;
}

/* ------------------------------------------------------------------ */
/*  @cdo/generated-scripts/sharedConstants                             */
/* ------------------------------------------------------------------ */
declare module '@cdo/generated-scripts/sharedConstants' {
  export const SectionLoginType: Record<string, string>;
  export const PlGradeValue: string;
  export const UserTypes: Record<string, string>;
  export const AiChatAccessLevels: Record<string, string>;
  export const AiDiffContext: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/templates/teacherNavigation/TeacherNavigationPaths       */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths' {
  export const TEACHER_NAVIGATION_BASE_URL: string;
  export const TEACHER_NAVIGATION_SECTIONS_URL: string;
  export const SPECIFIC_SECTION_BASE_URL: string;
  export const TEACHER_NAVIGATION_PATHS: Record<string, string>;
  export const TEACHER_NAVIGATION_PATH_NAMES: Record<string, string>;
  export function getBasePath(name: string): string;
  export function getPageNameFromPathname(pathname: string): string;
  export const LABELED_TEACHER_NAVIGATION_PATHS: Record<
    string,
    {url: string; absoluteUrl: string; label: () => string}
  >;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/templates/teacherDashboard/LoginTypeConstants            */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/templates/teacherDashboard/LoginTypeConstants' {
  export const LOGIN_TYPES_WITH_PASSWORD_COLUMN: string[];
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/sharedComponents/Spinner                                 */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/sharedComponents/Spinner' {
  import type {ComponentType} from 'react';
  const Spinner: ComponentType<{size?: string; style?: object}>;
  export default Spinner;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/templates/DemoChip                                       */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/templates/DemoChip' {
  import type {ComponentType} from 'react';
  const DemoChip: ComponentType<{className?: string}>;
  export default DemoChip;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/templates/GlobalEditionWrapper                           */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/templates/GlobalEditionWrapper' {
  import type {ComponentType, PropsWithChildren} from 'react';
  const GlobalEditionWrapper: ComponentType<
    PropsWithChildren<{geRegion?: string}>
  >;
  export default GlobalEditionWrapper;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/aiDifferentiation/AiDiffFloatingActionButton             */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton' {
  import type {ComponentType} from 'react';
  const AiDiffFloatingActionButton: ComponentType<{
    context?: string;
    sectionId?: number;
    unitId?: number;
    lessonId?: number;
  }>;
  export default AiDiffFloatingActionButton;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/loadingSkeleton                                     */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/loadingSkeleton' {
  import type {ComponentType} from 'react';
  const Skeleton: ComponentType<{style?: object}>;
  export default Skeleton;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/loadable                                            */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/loadable' {
  import type {ComponentType} from 'react';
  function loadable<T extends ComponentType<any>>(
    loader: () => Promise<{default: T}>,
  ): T;
  export default loadable;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/sharedComponents/productTour                             */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/sharedComponents/productTour/shepherdTourFactory' {
  export function createShepherdTour(steps: any[]): any;
}

declare module '@cdo/apps/sharedComponents/productTour/useOnboardingTour' {
  function useOnboardingTour(options: any): any;
  export default useOnboardingTour;
}

declare module '@cdo/apps/sharedComponents/productTour/productTourHelpers' {
  export function nextButton(tour: any): any;
  export function withSparkle(stepOptions: any): any;
  export function createCompletionStep(options: any): any;
  export function createQuizWhenHandlers(options: any): any;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/copyToClipboard                                     */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/copyToClipboard' {
  function copyToClipboard(text: string): Promise<void>;
  export default copyToClipboard;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/utils (storage helpers)                                  */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/utils' {
  export function tryGetSessionStorage(key: string, defaultValue?: any): any;
  export function trySetSessionStorage(key: string, value: any): void;
  export function tryGetLocalStorage(key: string, defaultValue?: any): any;
  export function trySetLocalStorage(key: string, value: any): void;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/detectNetworkAvailability                           */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/detectNetworkAvailability' {
  export function detectNetworkAvailability(): Promise<boolean>;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/util/AuthenticityTokenStore                              */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/util/AuthenticityTokenStore' {
  export function getAuthenticityToken(): string;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/lib/util/RailsAuthenticityToken                         */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/lib/util/RailsAuthenticityToken' {
  import type {ComponentType} from 'react';
  const RailsAuthenticityToken: ComponentType;
  export default RailsAuthenticityToken;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/lib/util/urlHelpers                                      */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/lib/util/urlHelpers' {
  export function pegasus(path: string): string;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/lib/util/UserPreferences                                 */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/lib/util/UserPreferences' {
  class UserPreferences {
    getNpsSurveyDontShowAgain(): Promise<boolean>;
    setNpsSurveyDontShowAgain(value: boolean): Promise<void>;
  }
  export default UserPreferences;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/flashes/FlashHandler                                     */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/flashes/FlashHandler' {
  export interface Flash {
    key: string;
    kind: string;
    message: string;
  }
  export class FlashHandler {
    static get(): Flash[];
  }
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/localization                                             */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/localization' {
  export function useLocalization(): {geRegion: string | null};
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/schoolInfo                                               */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/schoolInfo/hooks/useSchoolInfo' {
  export interface SchoolInfoData {
    country?: string;
    schoolType?: string;
    schoolName?: string;
    schoolId?: string;
    ncesSchoolId?: string;
    schoolZip?: string;
    schoolState?: string;
  }
  export function useSchoolInfo(): {
    data: SchoolInfoData | null;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module '@cdo/apps/schoolInfo/utils/updateSchoolInfo' {
  export function updateSchoolInfo(data: Record<string, any>): Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/templates/currentUserRedux                               */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/templates/currentUserRedux' {
  import type {Reducer} from 'redux';
  const currentUser: Reducer;
  export default currentUser;
  export function setShowAITALessonSummary(value: boolean): any;
  export function setHasCompletedPersonalizationQuiz(value: boolean): any;
  export function setShowAITAPodcasts(value: boolean): any;
}

/* ------------------------------------------------------------------ */
/*  @cdo/locale                                                        */
/* ------------------------------------------------------------------ */
declare module '@cdo/locale' {
  const i18n: Record<string, (...args: any[]) => string>;
  export default i18n;
}

/* ------------------------------------------------------------------ */
/*  @cdo/static/* (image assets)                                       */
/* ------------------------------------------------------------------ */
declare module '@cdo/static/skins/studio/alien_thumb.png' {
  const src: string;
  export default src;
}
declare module '@cdo/static/skins/studio/cat_thumb.png' {
  const src: string;
  export default src;
}
declare module '@cdo/static/skins/studio/dinosaur_thumb.png' {
  const src: string;
  export default src;
}
declare module '@cdo/static/skins/studio/dragon_thumb.png' {
  const src: string;
  export default src;
}
declare module '@cdo/static/skins/studio/knight_thumb.png' {
  const src: string;
  export default src;
}
declare module '@cdo/static/skins/studio/robot_thumb.png' {
  const src: string;
  export default src;
}

/* ------------------------------------------------------------------ */
/*  @cdo/apps/templates/studioHomepages/CoteacherInviteNotification    */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification' {
  import type {ComponentType} from 'react';
  const CoteacherInviteNotification: ComponentType;
  export default CoteacherInviteNotification;
}

/* ------------------------------------------------------------------ */
/*  Non-moved relative imports (still in apps/)                        */
/* ------------------------------------------------------------------ */
declare module '@cdo/apps/templates/teacherDashboard/AddSectionDialog' {
  import type {ComponentType} from 'react';
  const AddSectionDialog: ComponentType<any>;
  export default AddSectionDialog;
}

declare module '@cdo/apps/templates/teacherDashboard/RosterDialog' {
  import type {ComponentType} from 'react';
  const RosterDialog: ComponentType<any>;
  export default RosterDialog;
}

declare module '@cdo/apps/templates/SafeMarkdown' {
  import type {ComponentType} from 'react';
  const SafeMarkdown: ComponentType<{markdown: string}>;
  export default SafeMarkdown;
}

declare module '@cdo/apps/templates/teacherNavigation/EmptyState' {
  import type {ComponentType} from 'react';
  export const EmptyState: ComponentType<any>;
}

declare module '@cdo/apps/templates/SchoolDataInputs' {
  import type {ComponentType} from 'react';
  const SchoolDataInputs: ComponentType<any>;
  export default SchoolDataInputs;
}

declare module '@cdo/static/rebrand_banner/rebrand_banner_hero.png' {
  const src: string;
  export default src;
}

declare module '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers' {
  export const courseOfferings: any;
}
