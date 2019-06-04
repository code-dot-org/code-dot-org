require_relative 'decorator.rb'

module Pd::SurveyPipeline
  class DailySurveyDecorator < DecoratorBase
    # @param summary_data [Array<Hash>] an array of summary results.
    # @param parsed_data [Hash{:questions, :submissions => Hash}}] parsed questions and
    #   submissions we got from previous steps.
    # @return [Hash] data returned to client to render.
    #
    # TODO:
    # - Create a form table to look up form name.
    def self.decorate(summary_data:, parsed_data:)
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

      # Populate results for result[:this_workshop]
      summary_data.each do |summary|
        # Process only summarization for specific workshops and forms
        next unless summary[:workshop_id] && summary[:form_id]

        workshop_id = summary[:workshop_id]
        form_name = summary[:form_id].to_s

        result[:course_name] ||= Pd::Workshop.find_by_id(workshop_id)&.course
        result[:this_workshop][form_name] ||= {
          response_count: parsed_data[:submissions][summary[:form_id]].size,
          general: {}
        }

        result[:this_workshop][form_name][:general][summary[:name]] = summary[:reducer_result]
      end

      result
    end
  end
end
