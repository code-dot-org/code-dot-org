require_relative 'reducer.rb'

module Pd::SurveyPipeline
  class MapperBase
    def map_reduce(*)
      raise 'Must override in derived class'
    end
  end

  class GenericMapper < MapperBase
    attr_reader :group_config, :map_config

    # @param group_config [Array<key>] an array of keys in data going to be processed.
    # @param map_config [Array<Hash{:condition, :field, :reducers => lambda, key, Array}>]
    #   an array of rules that specify what reducers to apply on what fields when what
    #   conditions are met.
    #   :condition is a lambda.
    #   :field is a key in data going to be processed.
    #   :reducers is an array of ReducerBase-derived classes.
    def initialize(group_config:, map_config:)
      @group_config = group_config
      @map_config = map_config
    end

    # Summarize input data using groupping and mapping configurations.
    #
    # @param data [Array<Hash{}>] an array of hashes,
    #   each contains submission, question, and answer info.
    #
    # @return [Array<Hash>] an array of summarization results. Each hash contains
    #   all fields in group_config, reducer name and reducer result.
    def map_reduce(data)
      return unless data.is_a? Enumerable

      groups = group_data data
      map_to_reducers groups
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
