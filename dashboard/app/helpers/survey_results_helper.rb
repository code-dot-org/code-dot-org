module SurveyResultsHelper
  def show_survey?
    # Reasons we would not show the survey.
    if !current_user
      return false
    end
    if !current_user.teacher?
      return false
    end
    if current_user.under_13?
      return false
    end
    if language != "en"
      return false
    end
    if SurveyResult.where(user_id: current_user.id).exists?
      return false
    end

    # For testing purposes, we show the survey in non-production environments
    # regardless of account age or request location.
    if !Rails.env.production?
      return true
    end

    # More reasons we would not show the survey.
    if DateTime.now - current_user.created_at.to_datetime < 14
      return false
    end
    if request.location.try(:country_code) != 'US'
      return false
    end

    # There is no reason not to show the survey, so show the survey.
    return true
  end
end
