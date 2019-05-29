require_relative 'decorator.rb'

module Pd::SurveyPipeline
  class DailySurveyDecorator < DecoratorBase
    attr_reader :form_names

    # def initialize(form_names:)
    #   # TODO: read from constant list
    #   # TODO: provide a way to override option
    #   @form_names = form_names
    # end

    def self.decorate(summary_data:, parsed_data:, form_data: nil, logger: nil)
      return unless summary_data && parsed_data

      logger&.debug "DECO: summary_data.count = #{summary_data.count}"
      logger&.debug "DECO: transformed_data.count = #{parsed_data.count}"

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

        form_questions.each do |qid, qcontent|
          next if qcontent[:hidden]
          dest_collection[qcontent[:name]] = qcontent.except(:name)
        end
      end

      logger&.debug "DECO: result[:questions] = #{result[:questions]}"

      # Populate results for result[:this_workshop]


      # # Build question list from transformed_data
      # transformed_data.each do |record|
      #   next if !!record[:hidden]
      #   form_name = get_form_name(record[:form_id], form_names)
      #   result[:questions][form_name] ||= {general: {}}
      #   q_name = record[:name]
      #   next if result[:questions][form_name][:general].include? q_name
      #   result[:questions][form_name][:general][q_name] =
      #     record.except(:workshop_id, :form_id, :submission_id, :name, :qid, :type, :order, :answer)
      # end
      #
      # # Populate results for result[:this_workshop]
      # summary_data.each do |summary|
      #   # Not yet support calculating result[:all_my_workshops]
      #   next unless summary.dig(:workshop_id)
      #   # Not yet support combining results from different forms
      #   next unless summary.dig(:form_id)
      #   result[:course_name] ||= get_course_name(summary[:workshop_id])
      #   form_name = get_form_name(summary[:form_id], form_names)
      #   result[:this_workshop][form_name] ||= {general: {}}
      #   # TODO: get total response count
      #   result[:this_workshop][form_name][:general][summary[:name]] = summary[:reducer_result]
      # end

      result
    end

    private

    def get_form_name(form_id, form_names)
      form_names.dig(form_id) || form_id.to_s
    end

    def get_course_name(workshop_id)
      # TODO: implement real lookup
      'CS Fundamentals'
    end
  end
end

__END__

# summary_data.each do |row|
#   # Not yet support calculating result[:all_my_workshops]
#   next unless row.dig(:workshop_id)
#   # Not yet support combining results from different forms
#   next unless row.dig(:form_id)

#   # Populate data for result[:this_workshop]
#   result[:course_name] ||= get_course_name(row[:workshop_id])

#   form_name = get_form_name(row[:form_id], form_names)
#   result[:this_workshop][form_name] ||= {general: {}}

#   if row.dig(:qid)
#     #next unless row.dig(:reducer)&.downcase == 'histogram'
#     logger&.debug "DECO: row w/ question = #{row}"
#     qname = question_names[{form_id: row[:form_id], qid: row[:qid]}]
#     result[:this_workshop][form_name][:general][qname] = row[:reducer_result]
#   elsif row.dig(:reducer)&.downcase == 'count' || row.dig(:reducer)&.downcase == 'count_distinct'
#     # TODO: we have the retrieved_data, get response_count directly from it instead (cheaper!)
#     logger&.debug "DECO: row w/o question = #{row}"
#     result[:this_workshop][form_name][:response_count] = row[:reducer_result]
#   end
# end
-