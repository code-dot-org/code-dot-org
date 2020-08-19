module Pd
  module WorkshopSurveyFoormConstants
    include SharedWorkshopConstants

    DAILY_SURVEY_CONFIG_PATHS = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/summer_workshop_daily_survey',
      # TODO: update with real survey and add rest of AYW subjects
      SUBJECT_WORKSHOP_4 => 'surveys/pd/ayw_workshop_post_survey'
    }

    POST_SURVEY_CONFIG_PATHS = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/summer_workshop_post_survey',
      SUBJECT_CSF_101 => 'surveys/pd/workshop_csf_intro_post',
      SUBJECT_CSP_FOR_RETURNING_TEACHERS => 'surveys/pd/csp_wfrt_post_survey',
      SUBJECT_CSF_201 => 'surveys/pd/csf_deep_dive_post',
      SUBJECT_WORKSHOP_1 => 'surveys/pd/ayw_workshop_post_survey',
      SUBJECT_WORKSHOP_2 => 'surveys/pd/ayw_workshop_post_survey',
      SUBJECT_WORKSHOP_3 => 'surveys/pd/ayw_workshop_post_survey',
      SUBJECT_WORKSHOP_4 => 'surveys/pd/ayw_workshop_post_survey',
      SUBJECT_WORKSHOP_1_2 => 'surveys/pd/ayw_workshop_post_survey',
      SUBJECT_WORKSHOP_3_4 => 'surveys/pd/ayw_workshop_post_survey',
      SUBJECT_VIRTUAL_KICKOFF => 'surveys/pd/ayw_kickoff_call'
    }

    PRE_SURVEY_CONFIG_PATHS = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/summer_workshop_pre_survey',
      SUBJECT_CSF_201 => 'surveys/pd/csf_deep_dive_pre',
      SUBJECT_WORKSHOP_1 => 'surveys/pd/ayw_workshop_pre_survey',
      SUBJECT_WORKSHOP_2 => 'surveys/pd/ayw_workshop_pre_survey',
      SUBJECT_WORKSHOP_3 => 'surveys/pd/ayw_workshop_pre_survey',
      SUBJECT_WORKSHOP_4 => 'surveys/pd/ayw_workshop_pre_survey',
      SUBJECT_WORKSHOP_1_2 => 'surveys/pd/ayw_workshop_pre_survey',
      SUBJECT_WORKSHOP_3_4 => 'surveys/pd/ayw_workshop_pre_survey'
    }

    FOORM_SUBMIT_API = '/api/v1/pd/foorm/workshop_survey_submission'

    FACILITATORS = 'facilitators'
    FACILITATOR_ID = 'facilitator_id'
    FACILITATOR_NAME = 'facilitator_name'
    FACILITATOR_POSITION = 'facilitator_position'

    ACADEMIC_YEAR_WORKSHOPS = {
      "AYW1" => SUBJECT_WORKSHOP_1,
      "AYW2" => SUBJECT_WORKSHOP_2,
      "AYW3" => SUBJECT_WORKSHOP_3,
      'AYW4' => SUBJECT_WORKSHOP_4,
      "AYW1_2" => SUBJECT_WORKSHOP_1_2,
      "AYW3_4" => SUBJECT_WORKSHOP_3_4,
      "kickoff" => SUBJECT_VIRTUAL_KICKOFF
    }

    # Subjects that use the general survey urls and are in Foorm
    FOORM_GENERAL_SURVEY_SUBJECTS = [SUBJECT_SUMMER_WORKSHOP]
  end
end
