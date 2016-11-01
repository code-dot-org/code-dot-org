module Pd::WorkshopSurveyReportCsvConverter
  extend ActiveSupport::Concern

  def convert_to_csv(survey_report)
    csv_report = []

    survey_report.each_key do |key|
      survey_report_line = Hash.new

      survey_report[key].each_key do |question|
        if survey_report[key][question].is_a?(Array)
          survey_report_line[question.to_s.chomp('_s')] = survey_report[key][question].join(' / ')
        else
          survey_report_line[question.to_s.chomp('_s')] = survey_report[key][question]
        end
      end

      csv_report << {Workshops: key.is_a?(Symbol) ? key.to_s.titleize : key}.stringify_keys.merge(survey_report_line)
    end

    csv_report
  end
end
