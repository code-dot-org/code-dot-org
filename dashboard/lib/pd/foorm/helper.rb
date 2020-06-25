module Pd::Foorm
  module Helper
    # generate a standard key based on form name and version
    def get_form_key(form_name, form_version)
      "#{form_name}.#{form_version}"
    end

    # get friendly name for survey based on submission.
    # Name will either be Day X or Overall
    def get_survey_key(ws_submission)
      if ws_submission.day == 0
        return "Pre Workshop"
      end
      if ws_submission.day
        return "Day #{ws_submission.day}"
      else
        return "Post Workshop"
      end
    end

    # Get order for each survey_key
    # Pre-Workshop is first, daily surveys (named Day X)
    # are ordered by day, and post-workshop is last.
    def get_index_for_survey_key(survey_key)
      if survey_key == "Pre Workshop"
        return 0
      end
      if survey_key.include?("Day")
        return survey_key[4..-1].to_i
      end
      # anything else (post workshop) should go last
      return 1000
    end
  end
end
