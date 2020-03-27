module Pd::Foorm
  module Helper
    # generate a standard key based on form name and version
    def get_form_key(form_name, form_version)
      "#{form_name}.#{form_version}"
    end

    # get friendly name for survey based on submission.
    # Name will either be Day X or Overall
    def get_survey_key(ws_submission)
      if ws_submission.day
        return "Day #{ws_submission.day}"
      else
        return "Overall"
      end
    end
  end
end
