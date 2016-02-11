module SurveyResultsHelper

  def show_survey?
    # English only for now
    if language == "en"
      # US only
      if request.location.try(:country_code) == 'US' || (!Rails.env.production? && request.location.try(:country_code) == 'RD')
        # If signed in, and user hasn't already filled out this survey
        if current_user && !SurveyResult.where(user_id: current_user.id).exists?
          # Temporarily, if user is an admin.  And if they're a teacher.
          if current_user.admin? && current_user.teacher?
            # If at least 13, and account is at least 14 days old
            if !current_user.under_13? && (DateTime.now - current_user.created_at.to_datetime) >= 14
              return true
            end
          end
        end
      end
    end

    false

  end
end
