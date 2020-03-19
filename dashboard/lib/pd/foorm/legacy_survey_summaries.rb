# Retrieves, parses and summarizes Foorm Survey results for consumption by APIs.
module Pd::Foorm
  class LegacySurveySummaries
    def self.get_summaries(facilitator_id)
      data = Pd::LegacySurveySummary.where(
        facilitator_id: facilitator_id,
        course: Pd::Workshop::COURSE_CSF,
        subject: Pd::Workshop::SUBJECT_CSF_101
      ).first&.data
      csf_intro_post_workshop_from_pegasus = JSON.parse(data) if data

      csf_intro_post_workshop_from_pegasus_with_strings = {}
      csf_intro_post_workshop_from_pegasus.each_pair do |key, value|
        csf_intro_post_workshop_from_pegasus_with_strings[I18n.t("pd.survey.#{key}")] = value
      end

      data = Pd::LegacySurveySummary.where(
        facilitator_id: nil,
        course: Pd::Workshop::COURSE_CSF,
        subject: Pd::Workshop::SUBJECT_CSF_101
      ).first&.data
      csf_intro_post_workshop_from_pegasus_for_all_workshops = JSON.parse(data) if data

      csf_intro_post_workshop_from_pegasus_for_all_workshops_with_strings = {}
      csf_intro_post_workshop_from_pegasus_for_all_workshops.each_pair do |key, value|
        csf_intro_post_workshop_from_pegasus_for_all_workshops_with_strings[I18n.t("pd.survey.#{key}")] = value
      end

      data = Pd::LegacySurveySummary.where(
        facilitator_id: facilitator_id,
        course: Pd::Workshop::COURSE_CSD,
        subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
      ).first&.data
      csd_summer_workshops_from_jotform = JSON.parse(data) if data

      data = Pd::LegacySurveySummary.where(
        facilitator_id: facilitator_id,
        course: Pd::Workshop::COURSE_CSP,
        subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
      ).first&.data
      csp_summer_workshops_from_jotform = JSON.parse(data) if data

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
