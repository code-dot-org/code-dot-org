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
      if survey_key.start_with? "Pre Workshop - Module"
        # last character will be the module number, use that as an index
        return survey_key[-1].to_i
      elsif survey_key.start_with? "Pre Workshop"
        # any other pre-survey, return 0
        return 0
      elsif survey_key.include?("Day")
        return 100 + survey_key[4..-1].to_i
      elsif survey_key.start_with? "Post Workshop - Module"
        # last character will be the module number, use that as an index
        return 1000 + survey_key[-1].to_i
      else
        # any other post workshop key--there should only be one if the workshop
        # was not per-module.
        return 1000
      end
    end

    def fill_question_placeholders(question)
      question&.sub!("{panel.facilitator_name}", "my facilitator")
      question
    end

    protected

    def get_friendly_agenda(workshop_agenda)
      # if workshop agenda starts with module, the agenda will be in the format "module1"
      # convert to Module 1 for readability
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
