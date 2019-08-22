require_relative 'reducer.rb'

module Pd::SurveyPipeline::GenericMapper
  # Break data into groups using group keys.
  def group_data(data, group_keys)
    data.group_by {|hash| hash.slice(*group_keys)}
  end

  # Map groups to reducers using mapping configuration.
  # TODO: how to return errors
  def map_groups_to_reducers(groups, map_config)
    summaries = []
    errors = []

    groups.each do |group_key, group_records|
      # Apply matched reducers on each group.
      # Add only non-empty result to the final summary.
      map_config.each do |condition:, field:, reducers:|
        next unless condition.call(group_key)

        reducers.each do |reducer|
          # Only process values that are not nil
          reducer_result = reducer.reduce group_records.pluck(field).compact
          next unless reducer_result.present?

          summaries << group_key.merge({reducer: reducer.name, reducer_result: reducer_result})
        rescue => e
          errors << e.message
        end
      end
    end

    [summaries, errors]
  end

  def get_default_map_config
    is_single_select_answer = lambda {|hash| hash.dig(:answer_type) == 'singleSelect'}
    not_single_select_answer = lambda {|hash| hash.dig(:answer_type) != 'singleSelect'}

    [
      {
        condition: is_single_select_answer,
        field: :answer,
        reducers: [Pd::SurveyPipeline::HistogramReducer]
      },
      {
        condition: not_single_select_answer,
        field: :answer,
        reducers: [Pd::SurveyPipeline::NoOpReducer]
      }
    ]
  end
end
