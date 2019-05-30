require_relative 'decorator.rb'

module Pd::SurveyPipeline
  class DailySurveyDecorator < DecoratorBase
    attr_reader :form_names

    def self.decorate(summary_data:, parsed_data:, form_data: nil, logger: nil)
      return unless summary_data && parsed_data

      result = {
        course_name: nil,
        questions: {},
        this_workshop: {},
        all_my_workshops: {},
        facilitators: {},
        facilitator_averages: {},
        facilitator_response_counts: {}
      }

      # Build non-hidden question list result[:questions]
      questions = parsed_data[:questions]
      questions.each do |form_id, form_questions|
        result[:questions][form_id] ||= {general: {}}
        dest_collection = result[:questions][form_id][:general]

        form_questions.each do |_, qcontent|
          next if qcontent[:hidden]
          dest_collection[qcontent[:name]] = qcontent.except(:name)
        end
      end

      logger&.debug "DECO: result[:questions] = #{result[:questions]}"

      # Populate results for result[:this_workshop]
      summary_data.each do |summary|
        # Process only summarization for a specific workshop and form
        next unless summary[:workshop_id] && summary[:form_id]

        workshop_id = summary[:workshop_id]
        form_name = summary[:form_id].to_s   # TODO: look up form name

        result[:course_name] ||= Pd::Workshop.find_by_id(workshop_id)&.course
        result[:this_workshop][form_name] ||= {
          response_count: parsed_data[:submissions][summary[:form_id]].size,
          general: {}
        }

        result[:this_workshop][form_name][:general][summary[:name]] = summary[:reducer_result]
      end

      logger&.debug "DECO: result[:course_name] = #{result[:course_name]}"
      logger&.debug "DECO: result[:this_workshop] = #{result[:this_workshop]}"

      result
    end

    private

    def get_form_name(form_id, form_names)
      form_names.dig(form_id) || form_id.to_s
    end
  end
end
