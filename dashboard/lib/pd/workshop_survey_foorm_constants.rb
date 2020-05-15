module Pd
  module WorkshopSurveyFoormConstants
    include SharedWorkshopConstants

    DAILY_SURVEY_NAMES = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/survey_placeholder'
    }

    POST_SURVEY_NAMES = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/summer_workshop_post_survey',
      SUBJECT_CSF_101 => 'surveys/pd/workshop_csf_intro_post',
    }

    PRE_SURVEY_NAMES = {
      SUBJECT_SUMMER_WORKSHOP => 'surveys/pd/survey_placeholder'
    }

    FOORM_SUBMIT_API = '/api/v1/pd/foorm/workshop_survey_submission'
  end
end
