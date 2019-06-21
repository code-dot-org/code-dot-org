require_relative 'reducer.rb'

module Pd::SurveyPipeline
  class GenericMapper < SurveyPipelineWorker
    attr_reader :group_config, :map_config

    REQUIRED_INPUT_KEYS = [:question_answer_joined]
    OUTPUT_KEYS = [:summaries]

    # TODO: summary
    # @param group_config [Array<key>] an array of keys in data going to be processed.
    # @param map_config [Array<Hash{:condition, :field, :reducers => lambda, key, Array}>]
    #   an array of rules that specify what reducers to apply on what fields when what
    #   conditions are met.
    #   :condition is a lambda.
    #   :field is a key in data going to be processed.
    #   :reducers is an array of ReducerBase-derived classes.
    #
    def initialize(group_config:, map_config:)
      @group_config = group_config
      @map_config = map_config
    end

    def process_data(context)
      missing_keys = REQUIRED_INPUT_KEYS - context.keys
      raise "Missing required input key(s) in #{self.class.name}: #{missing_keys}" if missing_keys.present?

      results = map_reduce context.slice(*REQUIRED_INPUT_KEYS)

      OUTPUT_KEYS.each do |key|
        context[key] ||= []
        context[key] += results[key]
      end

      context
    end

    # TODO: update @return
    # Summarize input data using groupping and mapping configurations.
    #
    # @param question_answer_joined [Array<Hash{}>] an array of hashes,
    #   each contains submission, question, and answer info.
    #
    # @return [Hash{:summaries => Array<Hash>}] contains an array of summarization results.
    #   Each result contains all fields in group_config, reducer name and reducer result.
    #
    def map_reduce(question_answer_joined:)
      # TODO: use generic input name `data`?
      groups = group_data question_answer_joined
      {summaries: map_to_reducers(groups)}
    end

    # Break data into groups using groupping configuration.
    def group_data(data)
      data.group_by {|hash| hash.slice(*group_config)}
    end

    # Map groups to reducers using mapping configuration.
    def map_to_reducers(groups)
      summaries = []

      groups.each do |group_key, group_records|
        # Apply matched reducers on each group.
        # Add only non-empty result to the final summary.
        map_config.each do |condition:, field:, reducers:|
          next unless condition.call(group_key)

          reducers.each do |reducer|
            reducer_result = reducer.reduce group_records.pluck(field)
            next unless reducer_result.present?

            summaries << group_key.merge({reducer: reducer.name, reducer_result: reducer_result})
          end
        end
      end

      summaries
    end
  end
end
