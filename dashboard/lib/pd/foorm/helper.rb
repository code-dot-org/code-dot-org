module Pd::Foorm
  module Helper
    def get_form_key(form_name, form_version)
      "#{form_name}.#{form_version}"
    end

    def get_survey_key(ws_submission)
      if ws_submission.day
        return "Day #{ws_submission.day}"
      else
        return "Overall"
      end
    end
  end
end
