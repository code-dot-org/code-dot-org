import type {Transport} from '../../transports/types';
import {
  ContactDetailsSchema,
  CurrentPermissionsSchema,
  CurrentUserSchema,
  DonorTeacherBannerDetailsSchema,
  HasDismissedPersonalizationAlertSchema,
  NetsimSignedInSchema,
  PostponeCensusBannerSchema,
  SchoolNameSchema,
  SignedInResponseSchema,
} from './users.schemata';

export function createUsersApi(transport: Transport) {
  return {
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
  };
}
