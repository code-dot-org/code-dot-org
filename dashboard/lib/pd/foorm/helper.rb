module Pd::Foorm
  module Helper
    # generate a standard key based on form name and version
    def get_form_key(form_name, form_version)
      "#{form_name}.#{form_version}"
    end

    # get friendly name for survey based on submission.
    # Name will either be Day X or Overall
    def get_survey_key(ws_submission)
      suffix = ws_submission.workshop_agenda ? " - #{get_friendly_agenda(ws_submission.workshop_agenda)}" : ""
      if ws_submission.day == 0
        return "Pre Workshop#{suffix}"
      elsif ws_submission.day
        return "Day #{ws_submission.day}"
      else
        return "Post Workshop#{suffix}"
      end
    end

    # Get order for each survey_key
    # Pre-Workshop is first, daily surveys (named Day X)
    # are ordered by day, and post-workshop is last.
    def get_index_for_survey_key(survey_key)
      if survey_key == "Pre Workshop"
        return 0
      elsif survey_key.start_with? "Pre Workshop - Module"
        # last character will be the module number, use that as an index
        return survey_key[survey_key.length - 1].to_i
      elsif survey_key.start_with? "Pre Workshop"
        # either in person or unknown agenda, we want it to be before daily results
        return 1
      elsif survey_key.include?("Day")
        return 100 + survey_key[4..-1].to_i
      elsif survey_key == "Post Workshop"
        return 1000
      elsif survey_key.starts_with? "Post Workshop - Module"
        # last character will be the module number, use that as an index
        return 1000 + survey_key[survey_key.length - 1].to_i
      else
        return 1001
      end
    end

    protected

    def get_friendly_agenda(workshop_agenda)
      if workshop_agenda.start_with? "module"
        return workshop_agenda.sub("module", "Module ")
      elsif workshop_agenda == "in_person"
        return "In Person"
      else
        # unknown agenda, return it as-is
        return workshop_agenda
      end
    end
  end
end
