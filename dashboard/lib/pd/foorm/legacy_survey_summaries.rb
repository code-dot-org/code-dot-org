# Retrieves legacy survey summary results from Pd::LegacySurveySummary for API use.
module Pd::Foorm
  class LegacySurveySummaries
    def self.get_summaries(facilitator)
      # CSF Intro post-workshop - my workshops
      data = Pd::LegacySurveySummary.where(
        facilitator: facilitator,
        course: Pd::Workshop::COURSE_CSF,
        subject: Pd::Workshop::SUBJECT_CSF_101
      ).first&.data
      csf_intro_post_workshop_from_pegasus = data ? JSON.parse(data) : {}

      # (Lookup strings from IDs.)
      csf_intro_post_workshop_from_pegasus_with_strings = {}
      csf_intro_post_workshop_from_pegasus.each_pair do |key, value|
        csf_intro_post_workshop_from_pegasus_with_strings[I18n.t("pd.survey.#{key}")] = value
      end

      # CSF Intro post-workshop - all workshops
      data = Pd::LegacySurveySummary.where(
        facilitator: nil,
        course: Pd::Workshop::COURSE_CSF,
        subject: Pd::Workshop::SUBJECT_CSF_101
      ).first&.data
      csf_intro_post_workshop_from_pegasus_for_all_workshops = data ? JSON.parse(data) : {}

      # (Lookup strings from IDs.)
      csf_intro_post_workshop_from_pegasus_for_all_workshops_with_strings = {}
      csf_intro_post_workshop_from_pegasus_for_all_workshops.each_pair do |key, value|
        csf_intro_post_workshop_from_pegasus_for_all_workshops_with_strings[I18n.t("pd.survey.#{key}")] = value
      end

      # CSD summer workshops
      data = Pd::LegacySurveySummary.where(
        facilitator: facilitator,
        course: Pd::Workshop::COURSE_CSD,
        subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
      ).first&.data
      csd_summer_workshops_from_jotform = data ? JSON.parse(data) : {}

      # CSP summer workshops
      data = Pd::LegacySurveySummary.where(
        facilitator: facilitator,
        course: Pd::Workshop::COURSE_CSP,
        subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
      ).first&.data
      csp_summer_workshops_from_jotform = data ? JSON.parse(data) : {}

      # Return everything.
      {
        csf_intro_post_workshop_from_pegasus: csf_intro_post_workshop_from_pegasus_with_strings,
        csf_intro_post_workshop_from_pegasus_for_all_workshops:
          csf_intro_post_workshop_from_pegasus_for_all_workshops_with_strings,
        csd_summer_workshops_from_jotform: csd_summer_workshops_from_jotform,
        csp_summer_workshops_from_jotform: csp_summer_workshops_from_jotform
      }
    end
  end
end
