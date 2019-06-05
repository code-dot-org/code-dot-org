require_relative 'decorator.rb'

module Pd::SurveyPipeline
  class DailySurveyDecorator < DecoratorBase
    FORM_IDS_TO_NAMES = {
      90_066_184_161_150 => {
        full_name: 'CS Fundamentals Deep Dive Pre-survey',
        short_name: 'Pre Workshop'
      },
      90_065_524_560_150 => {
        full_name: 'CS Fundamentals Deep Dive Post-survey',
        short_name: 'Post Workshop'
      },
      91_405_279_991_164 => {
        full_name: 'Facilitator Feedback Survey',
        short_name: 'Facilitator'
      }
    }

    # Combine summary data and parsed data into a format that UI client will understand.
    #
    # @param summary_data [Array<Hash>] an array of summary results.
    # @param parsed_data [Hash{:questions, :submissions => Hash}}] parsed questions and
    #   submissions we got from previous steps.
    #
    # @return [Hash] data returned to client to render.
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
      # Hash{form_name => {general => {question_name => question_content}}}
      questions = parsed_data[:questions]
      questions.each do |form_id, form_questions|
        form_name = get_form_name(form_id)

        result[:questions][form_name] ||= {general: {}}
        dest_collection = result[:questions][form_name][:general]

        form_questions.each do |_, qcontent|
          next if qcontent[:hidden]
          dest_collection[qcontent[:name]] = qcontent.except(:name)
        end
      end

      # Populate results for result[:this_workshop]
      # Hash{form_name => {response_count => number, general => {question_name => summary_result}}}
      summary_data.each do |summary|
        # Only process summarization for specific workshops and forms
        form_id = summary[:form_id]
        next unless summary[:workshop_id] && form_id

        workshop_id = summary[:workshop_id]
        form_name = get_form_name(form_id)

        result[:course_name] ||= Pd::Workshop.find_by_id(workshop_id)&.course
        result[:this_workshop][form_name] ||= {
          response_count: parsed_data[:submissions][form_id].size,
          general: {}
        }

        result[:this_workshop][form_name][:general][summary[:name]] = summary[:reducer_result]
      end

      result
    end

    def self.get_form_name(form_id)
      FORM_IDS_TO_NAMES[form_id]&.dig(:short_name) || form_id.to_s
    end
  end
end
