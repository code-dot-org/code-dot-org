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
    # @param data [Array<Hash{}>] an array of hashes,
    #   each contains submission, question, and answer info.
    # @return [Array<Hash>] an array of summarization results.
    def map_reduce(data:, logger: nil)
      return unless data.is_a? Enumerable

      groups = group_data(data)
      logger&.info "MAP: groups.count = #{groups.count}"
      logger&.debug "MAP: groups = #{groups}"

      map_to_reducers(groups, logger)
    end

    # Break data into groups using groupping configuration.
    def group_data(data)
      data.group_by {|hash| hash.slice(*group_config)}
    end

    # Map groups to reducers using mapping configuration.
    def map_to_reducers(groups, logger = nil)
      summaries = []

      groups.each do |group_key, group_records|
        logger&.debug "MAP: group_key = #{group_key}"
        logger&.debug "MAP: group_records.count = #{group_records.count}"

        # Apply matched reducers on each group. Add only non-empty result to the final summary.
        map_config.each do |condition:, field:, reducers:|
          logger&.debug "Match condition = #{condition.call(group_key)}"
          next unless condition.call(group_key)

          logger&.debug "MAP: reducers to apply = #{reducers.count}"
          reducers.each do |reducer|
            reducer_result = reducer.reduce group_records.pluck(field)
            logger&.debug "MAP: reducer.name = #{reducer.name}, result = #{reducer_result}"

            next unless reducer_result.present?
            summaries << group_key.merge({reducer: reducer.name, reducer_result: reducer_result})
          end
        end
      end

      return summaries
    end
  end
end
