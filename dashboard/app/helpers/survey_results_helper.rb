module SurveyResultsHelper
  def show_diversity_survey?
    return false unless current_user
    return false unless language == "en"
    return false if current_user.under_13?
    return false if existing_diversity_survey_2017_result?
    return false unless account_existed_14_days?
    return false unless current_user.teacher?
    return false unless has_any_students?
    return false unless has_any_student_under_13?
    return false unless country_us?

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

  def existing_diversity_survey_2017_result?
    SurveyResult.where(user_id: current_user.id, kind: SurveyResult::DIVERSITY_2017).exists?
  end

  def country_us?
    if Rails.env.production?
      request.location.try(:country_code) == 'US'
    else
      request.location.try(:country_code) == 'RD'
    end
  end

  def has_any_students?
    !current_user.students.empty?
  end

  def has_any_student_under_13?
    current_user.students.any?(&:under_13?)
  end
end
