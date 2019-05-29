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
    #   :condition is a lambda
    #   :field is a key in data going to be processed.
    #   :reducers is an array of ReducerBase-derived classes
    def initialize(group_config:, map_config:)
      @group_config = group_config
      @map_config = map_config
    end

    # Summarize input data using groupping and map-reducing configurations.
    # @param data [Array<Hash{}>] an array of hashes, each contains submission, question and answer info
    # @return [Array<Hash>] an array of summarization results
    def map_reduce(data:, logger: nil)
      return unless data.is_a? Array

      groups = data.group_by {|hash| hash.slice(*group_config)}
      logger&.info "MP: groups.count = #{groups.count}"
      logger&.debug "MP: groups = #{groups}"

      summaries = []

      # Apply reducers on each group
      groups.each do |group_key, group_records|
        logger&.debug "MP: group_key = #{group_key}"
        logger&.debug "MP: group_records.count = #{group_records.count}"

        map_config.each do |condition:, field:, reducers:|
          logger&.debug "Match condition = #{condition.call(group_key)}"
          next unless condition.call(group_key)

          logger&.debug "MP: reducers to apply = #{reducers.count}"
          reducers.each do |reducer|
            reducer_result = reducer.reduce group_records.pluck(field)
            logger&.debug "MP: reducer.name = #{reducer.name}, result = #{reducer_result}"

            next unless reducer_result.present?
            summaries << group_key.merge({reducer: reducer.name, reducer_result: reducer_result})
          end
        end
      end

      return summaries
    end
  end
end
