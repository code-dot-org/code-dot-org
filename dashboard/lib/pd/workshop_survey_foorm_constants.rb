module Pd
  module WorkshopSurveyFoormConstants
    include SharedWorkshopConstants

    DAILY_SURVEY_CONFIG_PATHS = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/summer_workshop_daily_survey'
    }

    POST_SURVEY_CONFIG_PATHS = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/summer_workshop_post_survey',
      SUBJECT_CSF_101 => 'surveys/pd/workshop_csf_intro_post',
      SUBJECT_CSP_FOR_RETURNING_TEACHERS => 'surveys/pd/csp_wfrt_post_survey',
      SUBJECT_CSF_201 => 'surveys/pd/csf_deep_dive_post'
    }

    PRE_SURVEY_CONFIG_PATHS = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/summer_workshop_pre_survey',
      SUBJECT_CSF_201 => 'surveys/pd/csf_deep_dive_pre'
    }

    FOORM_SUBMIT_API = '/api/v1/pd/foorm/workshop_survey_submission'

    FACILITATORS = 'facilitators'
    FACILITATOR_ID = 'facilitator_id'
    FACILITATOR_NAME = 'facilitator_name'
    FACILITATOR_POSITION = 'facilitator_position'
  end
end
