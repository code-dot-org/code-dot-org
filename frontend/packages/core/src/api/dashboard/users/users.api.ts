import {refreshCsrfToken} from '../../csrfToken';
import type {Transport} from '../../transports/types';
import {
  ContactDetailsSchema,
  CurrentPermissionsSchema,
  CurrentUserResponseSchema,
  CurrentUserSchema,
  DonorTeacherBannerDetailsSchema,
  HasDismissedPersonalizationAlertSchema,
  NetsimSignedInSchema,
  PostponeCensusBannerSchema,
  SchoolNameSchema,
  SignedInResponseSchema,
  UserSettingsResponseSchema,
} from './users.schemata';
import type {
  CreatePasswordParams,
  CurrentUserResponse,
  DeleteUserParams,
  UpdateEmailParams,
  UpdateParentEmailParams,
  UpdatePasswordParams,
  UpdateProfileParams,
  UpdateUserTypeParams,
  UserSettings,
} from './users.types';

// Accept: application/json keeps a signed-out response a 401 JSON, not a
// navigational redirect. Mutations reject with an ApiError (422/400) the caller
// maps to field/form messages.
const JSON_ACCEPT = {Accept: 'application/json'} as const;
const PARENT_EMAIL_CHANGE = 'PARENT_EMAIL_CHANGE';

export function createUsersApi(transport: Transport) {
  return {
    /**
     * GET /api/v1/users/current — validated snake_case response, used by the
     * auth bootstrap. Parsing here (not just casting) means a Rails response
     * that drifts from our schema surfaces as a ZodError the bootstrap catches
     * and degrades to an error outcome, rather than crashing later at the point
     * of use.
     */
    async getCurrent(): Promise<CurrentUserResponse> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/current',
      });
      return CurrentUserResponseSchema.parse(raw);
    },

    /**
     * GET /api/v1/users/current
     */
    async getCurrentUser() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/current',
      });

      return CurrentUserSchema.parse(raw);
    },

    /**
     * GET /api/v1/users/signed_in
     */
    async getUserSignedIn(): Promise<boolean> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/signed_in',
      });

      return SignedInResponseSchema.parse(raw).is_signed_in;
    },

    /**
     * GET /api/v1/users/netsim_signed_in
     */
    async getNetsimSignedIn() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/netsim_signed_in',
      });

      return NetsimSignedInSchema.parse(raw);
    },

    /**
     * GET /api/v1/users/me/school_name
     */
    async getSchoolName() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/school_name',
      });

      return SchoolNameSchema.parse(raw);
    },

    /**
     * GET /api/v1/users/me/contact_details
     */
    async getContactDetails() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/contact_details',
      });

      return ContactDetailsSchema.parse(raw);
    },

    /**
     * GET /api/v1/users/me/get_donor_teacher_banner_details
     */
    async getDonorTeacherBannerDetails() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/get_donor_teacher_banner_details',
      });

      return DonorTeacherBannerDetailsSchema.parse(raw);
    },

    /**
     * GET /api/v1/users/me/tos_version
     */
    async getTosVersion(): Promise<number> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/tos_version',
      });

      return typeof raw === 'number' ? raw : parseInt(raw as string, 10);
    },

    /**
     * GET /api/v1/users/current/permissions
     */
    async getCurrentPermissions() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/current/permissions',
      });

      return CurrentPermissionsSchema.parse(raw);
    },

    /**
     * POST /api/v1/users/me/accept_data_transfer_agreement
     */
    async acceptDataTransferAgreement() {
      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/accept_data_transfer_agreement',
      });
    },

    /**
     * POST /api/v1/users/me/postpone_census_banner
     */
    async postponeCensusBanner() {
      const raw = await transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/postpone_census_banner',
      });

      return PostponeCensusBannerSchema.parse(raw);
    },

    /**
     * POST /api/v1/users/me/dismiss_census_banner
     */
    async dismissCensusBanner() {
      const raw = await transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/dismiss_census_banner',
      });

      return PostponeCensusBannerSchema.parse(raw);
    },

    /**
     * POST /api/v1/users/me/dismiss_donor_teacher_banner
     */
    async dismissDonorTeacherBanner(params: {
      participate: boolean;
      source: string;
    }) {
      const {participate, source} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/dismiss_donor_teacher_banner',
        body: {participate, source},
      });
    },

    /**
     * POST /api/v1/users/me/dismiss_parent_email_banner
     */
    async dismissParentEmailBanner() {
      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/dismiss_parent_email_banner',
      });
    },

    /**
     * POST /api/v1/users/me/set_standards_report_info_to_seen
     */
    async setStandardsReportInfoToSeen() {
      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/me/set_standards_report_info_to_seen',
      });
    },

    /**
     * POST /api/v1/users/has_seen_progress_table_v2_invitation
     */
    async setHasSeenProgressTableV2Invitation(params: {
      hasSeenProgressTableV2Invitation: boolean;
      showProgressTableV2: boolean;
    }) {
      const {hasSeenProgressTableV2Invitation, showProgressTableV2} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/has_seen_progress_table_v2_invitation',
        body: {
          has_seen_progress_table_v2_invitation:
            hasSeenProgressTableV2Invitation,
          show_progress_table_v2: showProgressTableV2,
        },
      });
    },

    /**
     * POST /api/v1/users/date_progress_table_invitation_last_delayed
     */
    async setDateProgressTableInvitationLastDelayed(params: {
      dateProgressTableInvitationLastDelayed: string;
    }) {
      const {dateProgressTableInvitationLastDelayed} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/date_progress_table_invitation_last_delayed',
        body: {
          date_progress_table_invitation_last_delayed:
            dateProgressTableInvitationLastDelayed,
        },
      });
    },

    /**
     * POST /api/v1/users/has_seen_ai_assessments_announcement
     */
    async setHasSeenAiAssessmentsAnnouncement() {
      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/has_seen_ai_assessments_announcement',
      });
    },

    /**
     * POST /api/v1/users/disable_lti_roster_sync
     */
    async disableLtiRosterSync() {
      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/disable_lti_roster_sync',
      });
    },

    /**
     * POST /api/v1/users/:userId/ai_tutor_access
     */
    async updateAiTutorAccess(params: {
      userId: number;
      aiTutorAccess: boolean;
    }) {
      const {userId, aiTutorAccess} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: `/api/v1/users/${userId}/ai_tutor_access`,
        body: {ai_tutor_access: aiTutorAccess},
      });
    },

    /**
     * POST /api/v1/users/has_completed_ai_differentiation_welcome
     */
    async setHasCompletedAiDifferentiationWelcome() {
      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/has_completed_ai_differentiation_welcome',
      });
    },

    /**
     * POST /api/v1/users/set_seen_ta_scores
     */
    async setSeenTaScores(params: {lessonId: number}) {
      const {lessonId} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/set_seen_ta_scores',
        body: {lesson_id: lessonId},
      });
    },

    /**
     * POST /dashboardapi/v1/users/me/verify_captcha
     */
    async verifyCaptcha(params: {recaptchaResponse: string}) {
      const {recaptchaResponse} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/dashboardapi/v1/users/me/verify_captcha',
        body: {'g-recaptcha-response': recaptchaResponse},
      });
    },

    /**
     * GET /api/v1/users/has_dismissed_personalization_alert
     */
    async getHasDismissedPersonalizationAlert() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/has_dismissed_personalization_alert',
      });

      return HasDismissedPersonalizationAlertSchema.parse(raw);
    },

    /**
     * POST /api/v1/users/has_dismissed_personalization_alert
     */
    async setHasDismissedPersonalizationAlert(params: {
      hasDismissedPersonalizationAlert: boolean;
    }) {
      const {hasDismissedPersonalizationAlert} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/has_dismissed_personalization_alert',
        body: {
          has_dismissed_personalization_alert: hasDismissedPersonalizationAlert,
        },
      });
    },

    /**
     * POST /api/v1/users/has_seen_homepage_welcome
     */
    async setHasSeenHomepageWelcome(params: {hasSeenHomepageWelcome: boolean}) {
      const {hasSeenHomepageWelcome} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/api/v1/users/has_seen_homepage_welcome',
        body: {
          has_seen_homepage_welcome: hasSeenHomepageWelcome,
        },
      });
    },

    // --- My Account settings page ---

    /** GET /api/v1/users/me/settings */
    async getSettings(signal?: AbortSignal): Promise<UserSettings> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/users/me/settings',
        headers: JSON_ACCEPT,
        signal,
      });
      return UserSettingsResponseSchema.parse(raw);
    },

    /** PATCH /dashboardapi/users */
    async updateProfile(params: UpdateProfileParams): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/dashboardapi/users',
        headers: JSON_ACCEPT,
        body: {
          user: {
            ...(params.givenName !== undefined && {
              given_name: params.givenName,
            }),
            ...(params.familyName !== undefined && {
              family_name: params.familyName,
            }),
            ...(params.displayName !== undefined && {name: params.displayName}),
            ...(params.username !== undefined && {username: params.username}),
            ...(params.age !== undefined && {age: params.age}),
            ...(params.usState !== undefined && {us_state: params.usState}),
          },
        },
      });
    },

    /** PATCH /dashboardapi/users */
    async updatePassword(params: UpdatePasswordParams): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/dashboardapi/users',
        headers: JSON_ACCEPT,
        body: {
          user: {
            current_password: params.currentPassword,
            password: params.newPassword,
            password_confirmation: params.newPasswordConfirmation,
          },
        },
      });
    },

    /** PATCH /dashboardapi/users — SSO-only accounts add a first password. */
    async createPassword(params: CreatePasswordParams): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/dashboardapi/users',
        headers: JSON_ACCEPT,
        body: {
          user: {
            password: params.newPassword,
            password_confirmation: params.newPasswordConfirmation,
          },
        },
      });
    },

    /** PATCH /users/email */
    async updateEmail(params: UpdateEmailParams): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/users/email',
        headers: JSON_ACCEPT,
        body: {
          user: {
            email: params.newEmail,
            hashed_email: params.hashedEmail,
            current_password: params.currentPassword,
          },
        },
      });
    },

    /** PATCH /users/user_type */
    async updateUserType(params: UpdateUserTypeParams): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/users/user_type',
        headers: JSON_ACCEPT,
        body: {
          user: {
            user_type: params.userType,
            ...(params.email !== undefined && {email: params.email}),
            ...(params.hashedEmail !== undefined && {
              hashed_email: params.hashedEmail,
            }),
          },
        },
      });
    },

    /** PATCH /users/parent_email — add/update a student's parent/guardian email. */
    async updateParentEmail(params: UpdateParentEmailParams): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/users/parent_email',
        headers: JSON_ACCEPT,
        body: {
          user: {
            parent_email: params.parentEmail,
            parent_email_preference_opt_in: params.optIn,
            parent_email_preference_source: PARENT_EMAIL_CHANGE,
          },
        },
      });
    },

    // PATCH /users — clears the parent_email column. The dedicated
    // /users/parent_email endpoint always fires the "email added" mailer, so
    // removal goes through the registration update instead.
    async removeParentEmail(): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/users',
        headers: JSON_ACCEPT,
        body: {user: {parent_email: ''}},
      });
    },

    // DELETE /expire_other signs out every OTHER session, then re-signs this one
    // and 302s. redirect:'manual' stops the transport following it (a followed
    // DELETE would re-fire at the target and 404); the action still runs.
    async signOutOtherSessions(): Promise<void> {
      await transport.requestWithMeta({
        method: 'DELETE',
        url: '/expire_other',
        redirect: 'manual',
        headers: JSON_ACCEPT,
      });
      // expire_other rotates the session token; refresh ours or the next
      // mutation 422s on a stale token.
      await refreshCsrfToken(transport);
    },

    /** DELETE /users */
    async deleteUser(params: DeleteUserParams): Promise<void> {
      await transport.request<unknown>({
        method: 'DELETE',
        url: '/users',
        headers: JSON_ACCEPT,
        // DELETE reads a top-level password_confirmation, not a nested user[...].
        // Word/picture accounts send none.
        body:
          params.password !== undefined
            ? {password_confirmation: params.password}
            : undefined,
      });
    },
  };
}
