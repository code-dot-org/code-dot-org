module SurveyResultsHelper
  include Pd::SharedWorkshopConstants
  DIVERSITY_SURVEY_ENABLED = false
  NPS_SURVEY_ENABLED = true

  def show_diversity_survey?(kind)
    return false unless current_user
    return false unless language == "en"
    return false if current_user.under_13?
    return false if existing_survey_result?(kind)
    return false unless account_existed_14_days?
    return false unless current_user.teacher?
    return false unless has_any_students?
    return false unless has_any_student_under_13?
    return false unless country_us?
    return false unless SurveyResultsHelper::DIVERSITY_SURVEY_ENABLED

    # There is no reason not to show the survey, so show the survey.
    return true
  end

  def show_nps_survey?(kind)
    return false unless current_user
    return false unless language == "en"
    return false if current_user.under_13?
    return false if existing_survey_result?(kind)
    return false unless country_us?
    return false unless account_existed_14_days?

    return false unless SurveyResultsHelper::NPS_SURVEY_ENABLED

    # There is no reason not to show the survey, so show the survey.
    return true
  end

  def account_existed_14_days?
    DateTime.now - current_user.created_at.to_datetime >= 14
  end

  def existing_survey_result?(kind)
    SurveyResult.where(user_id: current_user.id, kind: kind).exists?
  end

  def country_us?
    us_code_for_env = Rails.env.production? ? 'US' : 'RD'
    request.location.try(:country_code) == us_code_for_env
  end

  def has_any_students?
    !current_user.students.empty?
  end

  def has_any_student_under_13?
    current_user.students.any?(&:under_13?)
  end

  JOTFORM = "jotform"
  PEGASUS = "pegasus"

  def survey_source(course, year)
    return nil unless YEARS.include? year

    if [COURSE_CSP, COURSE_CSD].include? course
      year > "2017-2018" ? JOTFORM : PEGASUS
    elsif course == COURSE_CSF
      year > "2018-2019" ? JOTFORM : PEGASUS
    elsif [
      COURSE_ECS,
      COURSE_CS_IN_A,
      COURSE_CS_IN_S,
      COURSE_COUNSELOR,
      COURSE_ADMIN,
      COURSE_FACILITATOR
    ].include? course
      PEGASUS
    else
      JOTFORM
    end
  end
end
