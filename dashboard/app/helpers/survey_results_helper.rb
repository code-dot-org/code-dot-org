module SurveyResultsHelper
  def show_diversity_survey?
    false unless current_user
    false unless language == "en"
    false if current_user.under_13?
    false if existing_diversity_survey_result?
    false unless account_existed_14_days?
    false unless teacher?
    false unless has_any_students?
    false unless has_any_student_under_13?
    false unless country_us?

    # There is no reason not to show the survey, so show the survey.
    return true
  end

  def show_nps_survey?
    # Disable NPS survey
    false
  end

  def account_existed_14_days?
    DateTime.now - current_user.created_at.to_datetime >= 14
  end

  def existing_diversity_survey_result?
    SurveyResult.where({user_id: current_user.id, kind: SurveyResult::DIVERSITY_2017}).exists?
  end

  def country_us?
    if Rails.env.production?
      request.location.try(:country_code) == 'US'
    else
      request.location.try(:country_code) == 'RD'
    end
  end

  def teacher?
    current_user.user_type == User::TYPE_TEACHER
  end

  def has_any_students?
    !current_user.students.empty?
  end

  def has_any_student_under_13?
    current_user.students.any?(&:under_13?)
  end
end
